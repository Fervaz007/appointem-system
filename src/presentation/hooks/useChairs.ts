import { useState, useEffect, useCallback } from "react";
import { Chair } from "@/domain/entities/Chair";

export function useChairs() {
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChairs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/chairs");
      if (!response.ok) throw new Error("Failed to fetch chairs");
      setChairs(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  const createChair = async (input: Chair) => {
    const response = await fetch("/api/chairs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create chair");
    }
    const created: Chair = await response.json();
    setChairs((prev) => [...prev, created]);
    return created;
  };

  const updateChair = async (id: string, input: Partial<Chair>) => {
    const response = await fetch(`/api/chairs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update chair");
    }
    const updated: Chair = await response.json();
    setChairs((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  };

  const deleteChair = async (id: string) => {
    const response = await fetch(`/api/chairs/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete chair");
    }
    setChairs((prev) => prev.filter((c) => c.id !== id));
  };

  useEffect(() => {
    fetchChairs();
  }, [fetchChairs]);

  return {
    chairs,
    loading,
    error,
    createChair,
    updateChair,
    deleteChair,
    refresh: fetchChairs,
  };
}
