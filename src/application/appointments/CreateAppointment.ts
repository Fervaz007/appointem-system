import { z } from "zod";
import { AppointmentRepository } from "../../domain/interfaces/AppointmentRepository";
import { Appointment } from "../../domain/entities/Appointment";

export const CreateAppointmentSchema = z.object({
  date: z.date(),
  hour: z.number().min(9).max(16),
  client: z.object({
    firstName: z.string().min(1, "Nombre es requerido"),
    lastName: z.string().min(1, "Apellido es requerido"),
    phone: z.string().min(1, "Teléfono es requerido"),
    email: z.string().email().optional(),
  }),
  service: z.object({
    id: z.string(),
    name: z.string(),
    duration: z.number(),
    price: z.number(),
  }),
  notes: z.string().optional(),
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;

export class CreateAppointmentUseCase {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(input: CreateAppointmentInput): Promise<Appointment> {
    const validatedData = CreateAppointmentSchema.parse(input);

    const appointment: Appointment = {
      id: Math.random().toString(36).substr(2, 9), // Generación simple de ID
      date: validatedData.date,
      hour: validatedData.hour,
      client: {
        id: Math.random().toString(36).substr(2, 9),
        ...validatedData.client,
      },
      service: validatedData.service,
      status: "pendiente",
      notes: validatedData.notes,
    };

    return await this.appointmentRepository.create(appointment);
  }
}
