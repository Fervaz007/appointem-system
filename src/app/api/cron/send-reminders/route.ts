import { NextResponse } from "next/server";
import {
  getAppointmentsUseCase,
} from "@/infrastructure/dependencies";
import { sendReminderEmail } from "@/lib/notifications";
import { handleApiError } from "@/lib/apiError";

/**
 * GET /api/cron/send-reminders
 *
 * Envía recordatorios por email a los clientes con citas confirmadas dentro de las próximas 24 horas.
 * Este endpoint debe ser llamado por un cron externo (ej. Vercel Cron Jobs cada hora).
 *
 * Para protegerlo en producción: verificar el header Authorization con CRON_SECRET.
 */
export async function GET(request: Request) {
  try {
    // Verificar secret para proteger el endpoint en producción
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const appointments = await getAppointmentsUseCase.execute();
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in23Hours = new Date(now.getTime() + 23 * 60 * 60 * 1000);

    // Citas confirmadas cuya hora esté entre 23h y 24h en el futuro
    const toRemind = appointments.filter((a) => {
      if (a.status !== "confirmada") return false;
      if (!a.client.email) return false;

      const appointmentDateTime = new Date(a.date);
      appointmentDateTime.setHours(a.hour, 0, 0, 0);

      return (
        appointmentDateTime.getTime() >= in23Hours.getTime() &&
        appointmentDateTime.getTime() <= in24Hours.getTime()
      );
    });

    const sent: string[] = [];
    for (const appt of toRemind) {
      try {
        await sendReminderEmail(appt);
        sent.push(appt.id);
      } catch (e) {
        console.error(`[cron/reminders] Error enviando recordatorio para cita ${appt.id}:`, e);
      }
    }

    console.log(`[cron/reminders] ${sent.length} recordatorios enviados`);
    return NextResponse.json({ success: true, sent });
  } catch (error) {
    return handleApiError(error);
  }
}
