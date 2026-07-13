import { DaySchedule } from "../entities/DaySchedule";

export interface DayScheduleRepository {
  findAll(): Promise<DaySchedule[]>;
  findByDate(date: string): Promise<DaySchedule | null>;
  upsert(schedule: DaySchedule): Promise<DaySchedule>;
  delete(date: string): Promise<void>;
}
