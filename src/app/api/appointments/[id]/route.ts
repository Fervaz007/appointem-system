import { NextResponse } from "next/server";
import {
  updateAppointmentUseCase,
  deleteAppointmentUseCase,
} from "@/infrastructure/dependencies";
import { handleApiError } from "@/lib/apiError";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (body.date) body.date = new Date(body.date);

    const appointment = await updateAppointmentUseCase.execute(id, body);
    return NextResponse.json(appointment);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteAppointmentUseCase.execute(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
