"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/ui/card";
import { Input } from "@/presentation/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/presentation/ui/dialog";
import { useClients } from "@/presentation/hooks/useClients";
import { ClientProfile } from "@/domain/entities/ClientProfile";
import { Appointment, AppointmentStatus } from "@/domain/entities/Appointment";

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pendiente: "Pendiente",
  pago_pendiente: "Pago Pendiente",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  completada: "Completada",
};

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pendiente: "text-amber-600",
  pago_pendiente: "text-blue-500",
  confirmada: "text-green-600",
  cancelada: "text-red-500",
  completada: "text-slate-400",
};

function formatHour(hour: number): string {
  if (hour === 12) return "12:00 PM";
  return hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
}

function AppointmentRow({ appointment }: { appointment: Appointment }) {
  return (
    <TableRow>
      <TableCell>{format(appointment.date, "d MMM yyyy", { locale: es })}</TableCell>
      <TableCell>{formatHour(appointment.hour)}</TableCell>
      <TableCell>{appointment.service.name}</TableCell>
      <TableCell>${appointment.service.price.toFixed(2)}</TableCell>
      <TableCell>
        <span className={STATUS_COLORS[appointment.status]}>
          {STATUS_LABELS[appointment.status]}
        </span>
      </TableCell>
      <TableCell className="text-slate-500 text-sm max-w-[200px] truncate">
        {appointment.notes || "—"}
      </TableCell>
    </TableRow>
  );
}

export default function ClientsAdmin() {
  const { profiles, loading } = useClients();
  const [search, setSearch] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<ClientProfile | null>(null);

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.client.firstName.toLowerCase().includes(q) ||
      p.client.lastName.toLowerCase().includes(q) ||
      p.client.phone.includes(q) ||
      (p.client.email?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <>
      <Card className="border-none shadow-2xl shadow-pink-200/20 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-pink-50/50 pb-6">
          <CardTitle className="text-pink-700 font-light text-2xl">Clientes</CardTitle>
          <CardDescription>
            Historial de clientes consolidado por email o teléfono.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <Input
            placeholder="Buscar por nombre, email o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm border-pink-100 focus:ring-pink-200 focus:border-pink-300 rounded-xl"
          />

          {loading && profiles.length === 0 ? (
            <p className="text-center text-slate-400 py-8">Cargando...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-slate-400 py-8">
              {search ? "Sin resultados para esa búsqueda." : "Aún no hay clientes registrados."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Última visita</TableHead>
                  <TableHead>Visitas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((profile) => (
                  <TableRow
                    key={profile.client.id}
                    className="cursor-pointer hover:bg-pink-50/50 transition-colors"
                    onClick={() => setSelectedProfile(profile)}
                  >
                    <TableCell className="font-medium">
                      {profile.client.firstName} {profile.client.lastName}
                    </TableCell>
                    <TableCell>{profile.client.phone}</TableCell>
                    <TableCell className="text-slate-500">
                      {profile.client.email || "—"}
                    </TableCell>
                    <TableCell>
                      {profile.lastVisit
                        ? format(profile.lastVisit, "d MMM yyyy", { locale: es })
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-pink-100 text-pink-700 text-sm font-semibold">
                        {profile.totalVisits}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de historial del cliente */}
      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="max-w-2xl rounded-2xl">
          {selectedProfile && (
            <>
              <DialogHeader>
                <DialogTitle className="text-pink-700 font-light text-xl">
                  {selectedProfile.client.firstName} {selectedProfile.client.lastName}
                </DialogTitle>
                <div className="text-sm text-slate-500 space-y-0.5 mt-1">
                  <p>📱 {selectedProfile.client.phone}</p>
                  {selectedProfile.client.email && (
                    <p>✉️ {selectedProfile.client.email}</p>
                  )}
                  <p className="text-pink-500 font-medium mt-1">
                    {selectedProfile.totalVisits} visita{selectedProfile.totalVisits !== 1 ? "s" : ""} completadas
                  </p>
                </div>
              </DialogHeader>

              <div className="mt-2 max-h-[400px] overflow-y-auto">
                {selectedProfile.appointments.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">Sin citas registradas.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead>Servicio</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Notas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedProfile.appointments.map((appt) => (
                        <AppointmentRow key={appt.id} appointment={appt} />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
