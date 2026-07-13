import { NextResponse } from "next/server";
import { chairUseCases } from "@/infrastructure/dependencies";
import { handleApiError } from "@/lib/apiError";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const chair = await chairUseCases.update(id, body);
    return NextResponse.json(chair);
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
    await chairUseCases.remove(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
