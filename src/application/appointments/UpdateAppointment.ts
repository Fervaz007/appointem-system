import { z } from "zod";
import { AppointmentRepository } from "../../domain/interfaces/AppointmentRepository";
import { Appointment } from "../../domain/entities/Appointment";

export const UpdateAppointmentSchema = z.object({
  date: z.coerce.date().optional(),
  hour: z.number().int().min(0).max(23).optional(),
  chairId: z.string().optional(),
  status: z.enum(["pendiente", "confirmada", "cancelada", "completada"]).optional(),
  notes: z.string().optional(),
  client: z
    .object({
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional(),
      phone: z.string().min(1).optional(),
      email: z.string().email().optional(),
    })
    .optional(),
  service: z
    .object({
      id: z.string(),
      name: z.string(),
      duration: z.number().positive(),
      price: z.number(),
    })
    .optional(),
});

export type UpdateAppointmentInput = z.infer<typeof UpdateAppointmentSchema>;

export class UpdateAppointmentUseCase {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(id: string, input: UpdateAppointmentInput): Promise<Appointment> {
    const validated = UpdateAppointmentSchema.parse(input);
    return await this.appointmentRepository.update(id, validated as Partial<Appointment>);
  }
}
