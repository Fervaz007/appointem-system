import { NextResponse } from "next/server";
import {
  getAppointmentsUseCase,
} from "@/infrastructure/dependencies";
import { handleApiError } from "@/lib/apiError";
import { ClientProfile } from "@/domain/entities/ClientProfile";
import { Client } from "@/domain/entities/Client";
import { Appointment } from "@/domain/entities/Appointment";

/**
 * GET /api/clients
 *
 * Retorna una lista de perfiles de clientes consolidados (agrupados por email o teléfono),
 * con el historial de citas de cada uno.
 */
export async function GET() {
  try {
    const appointments = await getAppointmentsUseCase.execute();

    // Agrupar citas por cliente único (por email si existe, sino por teléfono)
    const clientMap = new Map<string, { client: Client; appointments: Appointment[] }>();

    for (const appointment of appointments) {
      const key = appointment.client.email
        ? `email:${appointment.client.email.toLowerCase()}`
        : `phone:${appointment.client.phone}`;

      if (!clientMap.has(key)) {
        clientMap.set(key, {
          client: appointment.client,
          appointments: [],
        });
      }

      clientMap.get(key)!.appointments.push(appointment);
    }

    // Construir perfiles
    const profiles: ClientProfile[] = Array.from(clientMap.values()).map(({ client, appointments: appts }) => {
      const completed = appts.filter(
        (a) => a.status === "completada" || a.status === "confirmada"
      );
      const sorted = [...completed].sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      );

      return {
        client,
        appointments: [...appts].sort((a, b) => b.date.getTime() - a.date.getTime()),
        totalVisits: completed.length,
        lastVisit: sorted[0]?.date ?? null,
      };
    });

    // Ordenar por última visita más reciente
    profiles.sort((a, b) => {
      if (!a.lastVisit) return 1;
      if (!b.lastVisit) return -1;
      return b.lastVisit.getTime() - a.lastVisit.getTime();
    });

    return NextResponse.json(profiles);
  } catch (error) {
    return handleApiError(error);
  }
}
