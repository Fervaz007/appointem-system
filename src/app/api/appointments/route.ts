import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAppointmentsUseCase } from "@/infrastructure/dependencies";
import { CreateAppointmentSchema } from "@/application/appointments/CreateAppointment";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function GET() {
  try {
    const appointments = await getAppointmentsUseCase.execute();
    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener citas" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.date) body.date = new Date(body.date);

    const validated = CreateAppointmentSchema.parse(body);

    // 1. Insert client
    const { data: clientData, error: clientError } = await supabaseAdmin
      .from("clients")
      .insert({
        name: `${validated.client.firstName} ${validated.client.lastName}`,
        phone: validated.client.phone,
        email: validated.client.email ?? null,
      })
      .select("id")
      .single();

    if (clientError) throw new Error(clientError.message);

    // 2. Auto-assign chair (1–3) based on existing bookings for same date/time
    const dateStr = validated.date.toISOString().split("T")[0];
    const timeStr = `${String(validated.hour).padStart(2, "0")}:00:00`;

    const { data: existing } = await supabaseAdmin
      .from("Appointments")
      .select("chair_id")
      .eq("date", dateStr)
      .eq("time", timeStr);

    const usedChairs = new Set((existing ?? []).map((a) => a.chair_id));
    const chair = ["1", "2", "3"].find((c) => !usedChairs.has(c)) ?? "1";

    // 3. Insert appointment
    const { data: apptData, error: apptError } = await supabaseAdmin
      .from("Appointments")
      .insert({
        client_id: clientData.id,
        date: dateStr,
        time: timeStr,
        status: "pendiente",
        chair_id: chair,
      })
      .select()
      .single();

    if (apptError) throw new Error(apptError.message);

    return NextResponse.json(
      {
        id: apptData.id,
        date: validated.date,
        hour: validated.hour,
        client: { id: clientData.id, ...validated.client },
        service: validated.service,
        status: apptData.status,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: error.message || "Error al crear cita" }, { status: 400 });
  }
}
