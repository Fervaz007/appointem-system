import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function handleApiError(error: unknown) {
  console.error(error);

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const message = error instanceof Error ? error.message : "Error inesperado";
  return NextResponse.json({ error: message }, { status: 400 });
}
