import { useState, useEffect, useCallback } from "react";
import { ClientProfile } from "@/domain/entities/ClientProfile";
import { Appointment } from "@/domain/entities/Appointment";

type RawAppointment = Omit<Appointment, "date"> & { date: string };
type RawProfile = Omit<ClientProfile, "appointments" | "lastVisit"> & {
  appointments: RawAppointment[];
  lastVisit: string | null;
};

function parseProfile(raw: RawProfile): ClientProfile {
  return {
    ...raw,
    appointments: raw.appointments.map((a) => ({ ...a, date: new Date(a.date) })),
    lastVisit: raw.lastVisit ? new Date(raw.lastVisit) : null,
  };
}

export function useClients() {
  const [profiles, setProfiles] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/clients");
      if (!response.ok) throw new Error("Error al cargar clientes");
      const data: RawProfile[] = await response.json();
      setProfiles(data.map(parseProfile));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return { profiles, loading, error, refresh: fetchProfiles };
}
