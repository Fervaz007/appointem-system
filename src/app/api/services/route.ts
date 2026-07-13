import { NextResponse } from "next/server";
import { serviceUseCases } from "@/infrastructure/dependencies";
import { handleApiError } from "@/lib/apiError";

export async function GET() {
  try {
    const services = await serviceUseCases.list();
    return NextResponse.json(services);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const service = await serviceUseCases.create(body);
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
