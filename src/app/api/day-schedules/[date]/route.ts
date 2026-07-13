import { NextResponse } from "next/server";
import { dayScheduleUseCases } from "@/infrastructure/dependencies";
import { handleApiError } from "@/lib/apiError";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;
    await dayScheduleUseCases.remove(date);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
