import { useState, useEffect, useCallback } from "react";
import { Appointment } from "@/domain/entities/Appointment";
import { CreateAppointmentInput } from "@/application/appointments/CreateAppointment";
import { UpdateAppointmentInput } from "@/application/appointments/UpdateAppointment";

type RawAppointment = Omit<Appointment, "date"> & { date: string };

function parseAppointment(raw: RawAppointment): Appointment {
  return { ...raw, date: new Date(raw.date) };
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/appointments");
      if (!response.ok) throw new Error("Failed to fetch appointments");
      const data: RawAppointment[] = await response.json();
      setAppointments(data.map(parseAppointment));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  const createAppointment = async (input: CreateAppointmentInput) => {
    setLoading(true);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create appointment");
      }
      const newApp: RawAppointment = await response.json();
      const parsedApp = parseAppointment(newApp);
      setAppointments((prev) => [...prev, parsedApp]);
      return parsedApp;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAppointment = async (id: string, input: UpdateAppointmentInput) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update appointment");
      }
      const updated: RawAppointment = await response.json();
      const parsedApp = parseAppointment(updated);
      setAppointments((prev) => prev.map((a) => (a.id === id ? parsedApp : a)));
      return parsedApp;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete appointment");
      }
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    refresh: fetchAppointments,
  };
}
