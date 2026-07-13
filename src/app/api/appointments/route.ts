import { NextResponse } from "next/server";
import {
  getAppointmentsUseCase,
  createAppointmentUseCase,
} from "@/infrastructure/dependencies";
import { handleApiError } from "@/lib/apiError";

export async function GET() {
  try {
    const appointments = await getAppointmentsUseCase.execute();
    return NextResponse.json(appointments);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.date) body.date = new Date(body.date);

    const appointment = await createAppointmentUseCase.execute(body);
    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
