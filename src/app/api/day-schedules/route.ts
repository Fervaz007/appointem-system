import { NextResponse } from "next/server";
import { dayScheduleUseCases } from "@/infrastructure/dependencies";
import { handleApiError } from "@/lib/apiError";

export async function GET() {
  try {
    const schedules = await dayScheduleUseCases.list();
    return NextResponse.json(schedules);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const schedule = await dayScheduleUseCases.upsert(body);
    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
