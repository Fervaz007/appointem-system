import { useState, useEffect, useCallback } from "react";
import { DaySchedule } from "@/domain/entities/DaySchedule";

export function useDaySchedules() {
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/day-schedules");
      if (!response.ok) throw new Error("Failed to fetch day schedules");
      setSchedules(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  const upsertSchedule = async (input: DaySchedule) => {
    const response = await fetch("/api/day-schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save day schedule");
    }
    const saved: DaySchedule = await response.json();
    setSchedules((prev) => [...prev.filter((s) => s.date !== saved.date), saved]);
    return saved;
  };

  const deleteSchedule = async (date: string) => {
    const response = await fetch(`/api/day-schedules/${date}`, { method: "DELETE" });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete day schedule");
    }
    setSchedules((prev) => prev.filter((s) => s.date !== date));
  };

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return {
    schedules,
    loading,
    error,
    upsertSchedule,
    deleteSchedule,
    refresh: fetchSchedules,
  };
}
