import { z } from "zod";
import { DayScheduleRepository } from "../../domain/interfaces/DayScheduleRepository";
import { DaySchedule } from "../../domain/entities/DaySchedule";

export const DayScheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (YYYY-MM-DD)"),
  isClosed: z.boolean().default(false),
  closeHour: z.number().int().min(0).max(23).nullable().default(null),
  chairsAvailable: z.number().int().positive().nullable().default(null),
});

export class DayScheduleUseCases {
  constructor(private dayScheduleRepository: DayScheduleRepository) {}

  list(): Promise<DaySchedule[]> {
    return this.dayScheduleRepository.findAll();
  }

  upsert(input: unknown): Promise<DaySchedule> {
    const validated = DayScheduleSchema.parse(input);
    return this.dayScheduleRepository.upsert(validated);
  }

  remove(date: string): Promise<void> {
    return this.dayScheduleRepository.delete(date);
  }
}
