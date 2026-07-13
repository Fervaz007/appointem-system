import type { SupabaseClient } from "@supabase/supabase-js";
import { Chair } from "../../domain/entities/Chair";
import { ChairRepository } from "../../domain/interfaces/ChairRepository";

type ChairRow = {
  id: string;
  label: string;
  active: boolean;
};

function mapRow(row: ChairRow): Chair {
  return { id: row.id, label: row.label, active: row.active };
}

export class SupabaseChairRepository implements ChairRepository {
  constructor(private client: SupabaseClient) {}

  async findAll(): Promise<Chair[]> {
    const { data, error } = await this.client.from("chairs").select("*").order("id");
    if (error) throw new Error(error.message);
    return (data as ChairRow[]).map(mapRow);
  }

  async findById(id: string): Promise<Chair | null> {
    const { data, error } = await this.client
      .from("chairs")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapRow(data as ChairRow) : null;
  }

  async create(chair: Chair): Promise<Chair> {
    const { data, error } = await this.client
      .from("chairs")
      .insert({ id: chair.id, label: chair.label, active: chair.active })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapRow(data as ChairRow);
  }

  async update(id: string, chair: Partial<Chair>): Promise<Chair> {
    const patch: Record<string, unknown> = {};
    if (chair.label !== undefined) patch.label = chair.label;
    if (chair.active !== undefined) patch.active = chair.active;

    const { data, error } = await this.client
      .from("chairs")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapRow(data as ChairRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from("chairs").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
}
