import { useState, useEffect, useCallback } from "react";
import { Appointment } from "@/domain/entities/Appointment";
import { CreateAppointmentInput } from "@/application/appointments/CreateAppointment";

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/appointments");
      if (!response.ok) throw new Error("Failed to fetch appointments");
      const data = await response.json();
      // Convertir fechas de string a Date
      const parsedData = data.map((app: any) => ({
        ...app,
        date: new Date(app.date)
      }));
      setAppointments(parsedData);
    } catch (err: any) {
      setError(err.message);
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
      const newApp = await response.json();
      const parsedApp = { ...newApp, date: new Date(newApp.date) };
      setAppointments((prev) => [...prev, parsedApp]);
      return parsedApp;
    } catch (err: any) {
      setError(err.message);
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
    refresh: fetchAppointments
  };
}
