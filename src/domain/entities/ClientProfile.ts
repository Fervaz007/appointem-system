import { Appointment } from "./Appointment";
import { Client } from "./Client";

/**
 * Un perfil de cliente consolidado: su información de contacto más
 * el historial completo de citas asociadas a ese email/teléfono.
 */
export interface ClientProfile {
  client: Client;
  appointments: Appointment[];
  totalVisits: number;
  lastVisit: Date | null;
}
