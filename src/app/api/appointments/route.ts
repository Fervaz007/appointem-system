import { NextResponse } from "next/server";
import { createAppointmentUseCase, getAppointmentsUseCase } from "@/infrastructure/dependencies";

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
    // Convertir la fecha de string a Date
    if (body.date) body.date = new Date(body.date);
    
    const appointment = await createAppointmentUseCase.execute(body);
    return NextResponse.json(appointment, { status: 201 });
  } catch (error: any) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: error.message || "Error al crear cita" }, { status: 400 });
  }
}
