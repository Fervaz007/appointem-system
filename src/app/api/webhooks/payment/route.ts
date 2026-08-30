import { NextResponse } from "next/server";
import {
  getAppointmentsUseCase,
  updateAppointmentUseCase,
} from "@/infrastructure/dependencies";
import { handleApiError } from "@/lib/apiError";
import { sendConfirmationEmail } from "@/lib/notifications";

/**
 * POST /api/webhooks/payment
 *
 * Recibe una notificación de pago exitoso y confirma la cita asociada.
 * En producción, aquí se validaría la firma del webhook de la pasarela (Stripe/MercadoPago).
 *
 * Body esperado: { appointmentId: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { appointmentId } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { error: "appointmentId es requerido" },
        { status: 400 }
      );
    }

    // Obtener todas las citas y buscar la que corresponde
    const appointments = await getAppointmentsUseCase.execute();
    const appointment = appointments.find((a) => a.id === appointmentId);

    if (!appointment) {
      return NextResponse.json(
        { error: "Cita no encontrada" },
        { status: 404 }
      );
    }

    if (appointment.status !== "pago_pendiente") {
      return NextResponse.json(
        { error: `La cita está en estado '${appointment.status}', no se puede confirmar` },
        { status: 409 }
      );
    }

    // Confirmar la cita
    const confirmed = await updateAppointmentUseCase.execute(appointmentId, {
      status: "confirmada",
    });

    // Enviar correo de confirmación (best-effort, no falla si el email falla)
    try {
      await sendConfirmationEmail(confirmed);
    } catch (emailErr) {
      console.error("[webhook/payment] Error enviando email de confirmación:", emailErr);
    }

    return NextResponse.json({ success: true, appointment: confirmed });
  } catch (error) {
    return handleApiError(error);
  }
}
