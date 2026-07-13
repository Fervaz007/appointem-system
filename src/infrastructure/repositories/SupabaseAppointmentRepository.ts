import type { SupabaseClient } from "@supabase/supabase-js";
import { Appointment, AppointmentStatus } from "../../domain/entities/Appointment";
import { AppointmentRepository } from "../../domain/interfaces/AppointmentRepository";

type AppointmentRow = {
  id: string;
  client_id: string;
  date: string;
  time: string;
  status: string;
  chair_id: string;
  service_type: string;
  service_name: string;
  duration_hours: number;
  price: number;
  notes: string | null;
};

type ClientRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
};

function toDateStr(date: Date): string {
  return date.toISOString().split("T")[0];
}

function toTimeStr(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00:00`;
}

function parseDateStr(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

function parseHourFromTime(timeStr: string): number {
  return parseInt(timeStr.split(":")[0], 10);
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const [firstName, ...rest] = fullName.trim().split(/\s+/);
  return { firstName: firstName ?? "", lastName: rest.join(" ") };
}

export class SupabaseAppointmentRepository implements AppointmentRepository {
  constructor(private client: SupabaseClient) {}

  private mapRow(row: AppointmentRow, client: ClientRow): Appointment {
    const { firstName, lastName } = splitName(client.name);
    return {
      id: String(row.id),
      date: parseDateStr(row.date),
      hour: parseHourFromTime(row.time),
      client: {
        id: String(client.id),
        firstName,
        lastName,
        phone: client.phone,
        email: client.email ?? undefined,
      },
      service: {
        id: row.service_type,
        name: row.service_name,
        duration: row.duration_hours,
        price: Number(row.price),
        active: true,
      },
      chairId: String(row.chair_id),
      status: row.status as AppointmentStatus,
      notes: row.notes ?? undefined,
    };
  }

  private async hydrate(rows: AppointmentRow[]): Promise<Appointment[]> {
    if (rows.length === 0) return [];
    const clientIds = Array.from(new Set(rows.map((r) => r.client_id)));
    const { data: clients, error } = await this.client
      .from("clients")
      .select("*")
      .in("id", clientIds);
    if (error) throw new Error(error.message);

    const clientsById = new Map((clients as ClientRow[]).map((c) => [String(c.id), c]));
    return rows
      .map((row) => {
        const client = clientsById.get(String(row.client_id));
        return client ? this.mapRow(row, client) : null;
      })
      .filter((a): a is Appointment => a !== null);
  }

  async create(appointment: Appointment): Promise<Appointment> {
    const { data: clientData, error: clientError } = await this.client
      .from("clients")
      .insert({
        name: `${appointment.client.firstName} ${appointment.client.lastName}`,
        phone: appointment.client.phone,
        email: appointment.client.email ?? null,
      })
      .select("*")
      .single();
    if (clientError) throw new Error(clientError.message);

    const { data: apptData, error: apptError } = await this.client
      .from("Appointments")
      .insert({
        client_id: clientData.id,
        date: toDateStr(appointment.date),
        time: toTimeStr(appointment.hour),
        status: appointment.status,
        chair_id: appointment.chairId,
        service_type: appointment.service.id,
        service_name: appointment.service.name,
        duration_hours: appointment.service.duration,
        price: appointment.service.price,
        notes: appointment.notes ?? null,
      })
      .select("*")
      .single();
    if (apptError) throw new Error(apptError.message);

    return this.mapRow(apptData as AppointmentRow, clientData as ClientRow);
  }

  async findAll(): Promise<Appointment[]> {
    const { data, error } = await this.client.from("Appointments").select("*");
    if (error) throw new Error(error.message);
    return this.hydrate(data as AppointmentRow[]);
  }

  async findByDate(date: Date): Promise<Appointment[]> {
    const { data, error } = await this.client
      .from("Appointments")
      .select("*")
      .eq("date", toDateStr(date));
    if (error) throw new Error(error.message);
    return this.hydrate(data as AppointmentRow[]);
  }

  async findById(id: string): Promise<Appointment | null> {
    const { data, error } = await this.client
      .from("Appointments")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const hydrated = await this.hydrate([data as AppointmentRow]);
    return hydrated[0] ?? null;
  }

  async update(id: string, appointment: Partial<Appointment>): Promise<Appointment> {
    if (appointment.client) {
      const current = await this.findById(id);
      if (!current) throw new Error("Cita no encontrada");

      const mergedClient = { ...current.client, ...appointment.client };
      const { error: clientError } = await this.client
        .from("clients")
        .update({
          name: `${mergedClient.firstName} ${mergedClient.lastName}`,
          phone: mergedClient.phone,
          email: mergedClient.email ?? null,
        })
        .eq("id", current.client.id);
      if (clientError) throw new Error(clientError.message);
    }

    const patch: Record<string, unknown> = {};
    if (appointment.date) patch.date = toDateStr(appointment.date);
    if (appointment.hour !== undefined) patch.time = toTimeStr(appointment.hour);
    if (appointment.chairId !== undefined) patch.chair_id = appointment.chairId;
    if (appointment.status) patch.status = appointment.status;
    if (appointment.notes !== undefined) patch.notes = appointment.notes;
    if (appointment.service) {
      patch.service_type = appointment.service.id;
      patch.service_name = appointment.service.name;
      patch.duration_hours = appointment.service.duration;
      patch.price = appointment.service.price;
    }

    if (Object.keys(patch).length > 0) {
      const { error } = await this.client.from("Appointments").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
    }

    const updated = await this.findById(id);
    if (!updated) throw new Error("Cita no encontrada");
    return updated;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from("Appointments").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
}
