import type { SupabaseClient } from "@supabase/supabase-js";
import { DaySchedule } from "../../domain/entities/DaySchedule";
import { DayScheduleRepository } from "../../domain/interfaces/DayScheduleRepository";

type DayScheduleRow = {
  date: string;
  is_closed: boolean;
  close_hour: number | null;
  chairs_available: number | null;
};

function mapRow(row: DayScheduleRow): DaySchedule {
  return {
    date: row.date,
    isClosed: row.is_closed,
    closeHour: row.close_hour,
    chairsAvailable: row.chairs_available,
  };
}

export class SupabaseDayScheduleRepository implements DayScheduleRepository {
  constructor(private client: SupabaseClient) {}

  async findAll(): Promise<DaySchedule[]> {
    const { data, error } = await this.client
      .from("day_schedules")
      .select("*")
      .order("date");
    if (error) throw new Error(error.message);
    return (data as DayScheduleRow[]).map(mapRow);
  }

  async findByDate(date: string): Promise<DaySchedule | null> {
    const { data, error } = await this.client
      .from("day_schedules")
      .select("*")
      .eq("date", date)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapRow(data as DayScheduleRow) : null;
  }

  async upsert(schedule: DaySchedule): Promise<DaySchedule> {
    const { data, error } = await this.client
      .from("day_schedules")
      .upsert({
        date: schedule.date,
        is_closed: schedule.isClosed,
        close_hour: schedule.closeHour,
        chairs_available: schedule.chairsAvailable,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapRow(data as DayScheduleRow);
  }

  async delete(date: string): Promise<void> {
    const { error } = await this.client.from("day_schedules").delete().eq("date", date);
    if (error) throw new Error(error.message);
  }
}
