import { Resend } from "resend";
import { Appointment } from "@/domain/entities/Appointment";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const resend = new Resend(process.env.RESEND_API_KEY);

// El "from" debe ser un dominio verificado en Resend.
// Mientras se configura el dominio propio, usar el dominio sandbox de Resend.
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const BUSINESS_NAME = "Vanessa Gonzalez Studio";

function formatAppointmentDate(appointment: Appointment): string {
  return format(appointment.date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
}

function formatHour(hour: number): string {
  if (hour === 12) return "12:00 PM";
  return hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
}

/**
 * Envía el correo de confirmación de cita al cliente.
 * Se llama justo después de confirmar el pago.
 */
export async function sendConfirmationEmail(appointment: Appointment): Promise<void> {
  const clientEmail = appointment.client.email;
  if (!clientEmail) {
    console.warn("[notifications] Cliente sin email, omitiendo correo de confirmación");
    return;
  }

  const dateStr = formatAppointmentDate(appointment);
  const hourStr = formatHour(appointment.hour);
  const deposit = appointment.service.depositAmount ?? 0;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: [clientEmail],
    subject: `✅ Cita confirmada — ${BUSINESS_NAME}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto; color: #1e293b;">
        <h2 style="color: #db2777;">¡Tu cita está confirmada! 💅</h2>
        <p>Hola <strong>${appointment.client.firstName}</strong>, aquí están los detalles de tu cita:</p>
        <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding:6px 0; color:#94a3b8;">Servicio</td><td><strong>${appointment.service.name}</strong></td></tr>
          <tr><td style="padding:6px 0; color:#94a3b8;">Fecha</td><td><strong>${dateStr}</strong></td></tr>
          <tr><td style="padding:6px 0; color:#94a3b8;">Hora</td><td><strong>${hourStr}</strong></td></tr>
          ${deposit > 0 ? `<tr><td style="padding:6px 0; color:#94a3b8;">Anticipo pagado</td><td><strong>$${deposit.toFixed(2)}</strong></td></tr>` : ""}
        </table>
        <p>¡Te esperamos! Si necesitas cancelar o reagendar, contáctanos con anticipación.</p>
        <p style="color:#db2777; font-size:13px;">— ${BUSINESS_NAME}</p>
      </div>
    `,
  });

  console.log(`[notifications] Correo de confirmación enviado a ${clientEmail} (cita ${appointment.id})`);
}

/**
 * Envía el correo de recordatorio 24 horas antes de la cita.
 * Se llama desde el cron endpoint.
 */
export async function sendReminderEmail(appointment: Appointment): Promise<void> {
  const clientEmail = appointment.client.email;
  if (!clientEmail) {
    console.warn("[notifications] Cliente sin email, omitiendo recordatorio");
    return;
  }

  const dateStr = formatAppointmentDate(appointment);
  const hourStr = formatHour(appointment.hour);

  await resend.emails.send({
    from: FROM_EMAIL,
    to: [clientEmail],
    subject: `⏰ Recordatorio: Tu cita es mañana — ${BUSINESS_NAME}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto; color: #1e293b;">
        <h2 style="color: #db2777;">¡Tu cita es mañana! 🗓️</h2>
        <p>Hola <strong>${appointment.client.firstName}</strong>, te recordamos que tienes una cita programada:</p>
        <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding:6px 0; color:#94a3b8;">Servicio</td><td><strong>${appointment.service.name}</strong></td></tr>
          <tr><td style="padding:6px 0; color:#94a3b8;">Fecha</td><td><strong>${dateStr}</strong></td></tr>
          <tr><td style="padding:6px 0; color:#94a3b8;">Hora</td><td><strong>${hourStr}</strong></td></tr>
        </table>
        <p>¡Te esperamos! Si tienes alguna duda o necesitas cancelar, contáctanos lo antes posible.</p>
        <p style="color:#db2777; font-size:13px;">— ${BUSINESS_NAME}</p>
      </div>
    `,
  });

  console.log(`[notifications] Recordatorio enviado a ${clientEmail} (cita ${appointment.id})`);
}
