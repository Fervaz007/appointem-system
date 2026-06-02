import { Client } from "./Client";
import { Service } from "./Service";

export type AppointmentStatus = "pendiente" | "confirmada" | "cancelada" | "completada";

export interface Appointment {
  id: string;
  date: Date;
  hour: number;
  client: Client;
  service: Service;
  status: AppointmentStatus;
  notes?: string;
}
