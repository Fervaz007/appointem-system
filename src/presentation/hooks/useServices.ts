import { useState, useEffect, useCallback } from "react";
import { Service } from "@/domain/entities/Service";

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/services");
      if (!response.ok) throw new Error("Failed to fetch services");
      setServices(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  const createService = async (input: Omit<Service, "active"> & { active?: boolean }) => {
    const response = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create service");
    }
    const created: Service = await response.json();
    setServices((prev) => [...prev, created]);
    return created;
  };

  const updateService = async (id: string, input: Partial<Service>) => {
    const response = await fetch(`/api/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update service");
    }
    const updated: Service = await response.json();
    setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  };

  const deleteService = async (id: string) => {
    const response = await fetch(`/api/services/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete service");
    }
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    services,
    loading,
    error,
    createService,
    updateService,
    deleteService,
    refresh: fetchServices,
  };
}
