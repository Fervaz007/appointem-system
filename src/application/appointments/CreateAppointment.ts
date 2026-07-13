import { z } from "zod";
import { AppointmentRepository } from "../../domain/interfaces/AppointmentRepository";
import { ChairRepository } from "../../domain/interfaces/ChairRepository";
import { DayScheduleRepository } from "../../domain/interfaces/DayScheduleRepository";
import { Appointment } from "../../domain/entities/Appointment";
import { ChairConflictError } from "../../domain/errors/ChairConflictError";

export const DEFAULT_BUSINESS_OPEN_HOUR = 9;
export const DEFAULT_BUSINESS_CLOSE_HOUR = 16;

export const CreateAppointmentSchema = z.object({
  date: z.date(),
  hour: z.number().int().min(0).max(23),
  client: z.object({
    firstName: z.string().min(1, "Nombre es requerido"),
    lastName: z.string().min(1, "Apellido es requerido"),
    phone: z.string().min(1, "Teléfono es requerido"),
    email: z.string().email().optional(),
  }),
  service: z.object({
    id: z.string(),
    name: z.string(),
    duration: z.number().positive(),
    price: z.number(),
  }),
  notes: z.string().optional(),
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;

function toDateStr(date: Date): string {
  return date.toISOString().split("T")[0];
}

export class CreateAppointmentUseCase {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private chairRepository: ChairRepository,
    private dayScheduleRepository: DayScheduleRepository
  ) {}

  async execute(input: CreateAppointmentInput): Promise<Appointment> {
    const validated = CreateAppointmentSchema.parse(input);

    const schedule = await this.dayScheduleRepository.findByDate(toDateStr(validated.date));
    if (schedule?.isClosed) {
      throw new Error("El negocio no abre ese día");
    }

    const openHour = schedule?.openHour ?? DEFAULT_BUSINESS_OPEN_HOUR;
    const closeHour = schedule?.closeHour ?? DEFAULT_BUSINESS_CLOSE_HOUR;
    if (validated.hour < openHour || validated.hour + validated.service.duration > closeHour) {
      throw new Error("El horario solicitado está fuera del horario de atención de ese día");
    }

    const chairs = await this.chairRepository.findAll();
    const activeChairIds = chairs.filter((c) => c.active).map((c) => c.id);
    const maxChairs = schedule?.chairsAvailable ?? activeChairIds.length;
    const chairPool = activeChairIds.slice(0, Math.max(maxChairs, 0));

    if (chairPool.length === 0) {
      throw new Error("No hay sillas disponibles ese día");
    }

    const existing = (
      await this.appointmentRepository.findByDate(validated.date)
    ).filter((a) => a.status !== "cancelada");

    const occupiedChairsByHour = new Map<number, Set<string>>();
    for (const appt of existing) {
      for (let i = 0; i < appt.service.duration; i++) {
        const h = appt.hour + i;
        if (!occupiedChairsByHour.has(h)) occupiedChairsByHour.set(h, new Set());
        occupiedChairsByHour.get(h)!.add(appt.chairId);
      }
    }

    const availableChairs = chairPool.filter((chairId) => {
      for (let i = 0; i < validated.service.duration; i++) {
        const h = validated.hour + i;
        if (occupiedChairsByHour.get(h)?.has(chairId)) return false;
      }
      return true;
    });

    if (availableChairs.length === 0) {
      throw new Error("No hay disponibilidad para ese horario");
    }

    const appointment: Appointment = {
      id: "",
      date: validated.date,
      hour: validated.hour,
      client: { id: "", ...validated.client },
      service: validated.service,
      chairId: availableChairs[0],
      status: "pendiente",
      notes: validated.notes,
    };

    try {
      return await this.appointmentRepository.create(appointment, availableChairs);
    } catch (error) {
      if (error instanceof ChairConflictError) {
        throw new Error(
          "Alguien más acaba de reservar ese horario. Por favor elige otra hora o silla."
        );
      }
      throw error;
    }
  }
}
