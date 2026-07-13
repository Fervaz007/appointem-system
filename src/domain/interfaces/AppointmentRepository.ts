import { Appointment } from "../entities/Appointment";

export interface AppointmentRepository {
  create(appointment: Appointment, chairCandidates?: string[]): Promise<Appointment>;
  findAll(): Promise<Appointment[]>;
  findByDate(date: Date): Promise<Appointment[]>;
  findById(id: string): Promise<Appointment | null>;
  update(id: string, appointment: Partial<Appointment>): Promise<Appointment>;
  delete(id: string): Promise<void>;
}
