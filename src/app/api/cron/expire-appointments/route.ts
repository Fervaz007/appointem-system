import { NextResponse } from "next/server";
import {
  getAppointmentsUseCase,
  deleteAppointmentUseCase,
} from "@/infrastructure/dependencies";
import { handleApiError } from "@/lib/apiError";

const EXPIRY_MINUTES = 15;

/**
 * GET /api/cron/expire-appointments
 *
 * Libera las citas en estado "pago_pendiente" que tengan más de 15 minutos sin confirmar.
 * Este endpoint debe ser llamado por un cron externo (ej. Vercel Cron Jobs cada 5 minutos).
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
    const expiryMs = EXPIRY_MINUTES * 60 * 1000;

    // Filtrar citas pago_pendiente que hayan pasado el tiempo límite
    // Como el objeto Appointment no tiene createdAt, comparamos con la fecha de la cita.
    // NOTA: En una implementación más robusta se debería guardar created_at en Supabase.
    // Por ahora, se eliminan las pago_pendiente cuya fecha+hora ya pasó.
    const expired = appointments.filter((a) => {
      if (a.status !== "pago_pendiente") return false;
      const appointmentDateTime = new Date(a.date);
      appointmentDateTime.setHours(a.hour, 0, 0, 0);
      // Si la fecha+hora de la cita ya pasó, definitivamente expirar
      return appointmentDateTime.getTime() < now.getTime() - expiryMs;
    });

    const deleted: string[] = [];
    for (const appt of expired) {
      try {
        await deleteAppointmentUseCase.execute(appt.id);
        deleted.push(appt.id);
      } catch (e) {
        console.error(`[cron/expire] Error eliminando cita ${appt.id}:`, e);
      }
    }

    console.log(`[cron/expire] ${deleted.length} citas expiradas eliminadas`);
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    return handleApiError(error);
  }
}
