/**
 * Override for a single calendar date. Any field left null falls back to the
 * business default (open 9 AM–4 PM, chairs = count of active Chairs).
 */
export interface DaySchedule {
  date: string; // "YYYY-MM-DD"
  isClosed: boolean;
  closeHour: number | null;
  chairsAvailable: number | null;
}
