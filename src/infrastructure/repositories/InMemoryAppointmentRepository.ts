import { Appointment } from "../../domain/entities/Appointment";
import { AppointmentRepository } from "../../domain/interfaces/AppointmentRepository";
import { isSameDay, startOfDay, addDays } from "date-fns";

export class InMemoryAppointmentRepository implements AppointmentRepository {
  private appointments: Appointment[] = [];

  constructor() {
    // Datos iniciales mockeados
    this.seed();
  }

  private seed() {
    const today = startOfDay(new Date());
    this.appointments = [
      {
        id: "1",
        date: addDays(today, 1),
        hour: 9,
        client: { id: "c1", firstName: "Maria", lastName: "Perez", phone: "12345678" },
        service: { id: "balayage", name: "Balayage", duration: 5, price: 100 },
        status: "pendiente",
      },
      {
        id: "2",
        date: addDays(today, 1),
        hour: 14,
        client: { id: "c2", firstName: "Ana", lastName: "Gomez", phone: "87654321" },
        service: { id: "tinte", name: "Tinte", duration: 2, price: 50 },
        status: "pendiente",
      },
    ];
  }

  async create(appointment: Appointment): Promise<Appointment> {
    this.appointments.push(appointment);
    return appointment;
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointments;
  }

  async findByDate(date: Date): Promise<Appointment[]> {
    return this.appointments.filter((app) => isSameDay(app.date, date));
  }

  async findById(id: string): Promise<Appointment | null> {
    return this.appointments.find((app) => app.id === id) || null;
  }

  async update(id: string, appointment: Partial<Appointment>): Promise<Appointment> {
    const index = this.appointments.findIndex((app) => app.id === id);
    if (index === -1) throw new Error("Appointment not found");
    
    this.appointments[index] = { ...this.appointments[index], ...appointment };
    return this.appointments[index];
  }

  async delete(id: string): Promise<void> {
    this.appointments = this.appointments.filter((app) => app.id !== id);
  }
}

// Singleton para persistencia en memoria durante el ciclo de vida de la app (dev mode hot reload might reset it)
export const inMemoryAppointmentRepository = new InMemoryAppointmentRepository();
