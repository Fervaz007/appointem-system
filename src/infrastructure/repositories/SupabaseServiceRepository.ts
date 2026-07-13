import type { SupabaseClient } from "@supabase/supabase-js";
import { Service } from "../../domain/entities/Service";
import { ServiceRepository } from "../../domain/interfaces/ServiceRepository";

type ServiceRow = {
  id: string;
  name: string;
  duration_hours: number;
  price: number;
  active: boolean;
};

function mapRow(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    duration: row.duration_hours,
    price: Number(row.price),
    active: row.active,
  };
}

export class SupabaseServiceRepository implements ServiceRepository {
  constructor(private client: SupabaseClient) {}

  async findAll(): Promise<Service[]> {
    const { data, error } = await this.client.from("services").select("*").order("name");
    if (error) throw new Error(error.message);
    return (data as ServiceRow[]).map(mapRow);
  }

  async findById(id: string): Promise<Service | null> {
    const { data, error } = await this.client
      .from("services")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapRow(data as ServiceRow) : null;
  }

  async create(service: Service): Promise<Service> {
    const { data, error } = await this.client
      .from("services")
      .insert({
        id: service.id,
        name: service.name,
        duration_hours: service.duration,
        price: service.price,
        active: service.active,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapRow(data as ServiceRow);
  }

  async update(id: string, service: Partial<Service>): Promise<Service> {
    const patch: Record<string, unknown> = {};
    if (service.name !== undefined) patch.name = service.name;
    if (service.duration !== undefined) patch.duration_hours = service.duration;
    if (service.price !== undefined) patch.price = service.price;
    if (service.active !== undefined) patch.active = service.active;

    const { data, error } = await this.client
      .from("services")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapRow(data as ServiceRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from("services").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
}
