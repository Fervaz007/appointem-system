import { NextResponse } from "next/server";
import { chairUseCases } from "@/infrastructure/dependencies";
import { handleApiError } from "@/lib/apiError";

export async function GET() {
  try {
    const chairs = await chairUseCases.list();
    return NextResponse.json(chairs);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const chair = await chairUseCases.create(body);
    return NextResponse.json(chair, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
