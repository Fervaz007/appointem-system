"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/ui/card";
import { Button } from "@/presentation/ui/button";
import { Input } from "@/presentation/ui/input";
import { Label } from "@/presentation/ui/label";
import { Textarea } from "@/presentation/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/ui/select";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/presentation/ui/dialog";
import { useAppointments } from "@/presentation/hooks/useAppointments";
import { useChairs } from "@/presentation/hooks/useChairs";
import { useServices } from "@/presentation/hooks/useServices";
import { Appointment, AppointmentStatus } from "@/domain/entities/Appointment";

const STATUS_OPTIONS: AppointmentStatus[] = ["pendiente", "confirmada", "cancelada", "completada"];

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  completada: "Completada",
};

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pendiente: "text-amber-600",
  confirmada: "text-green-600",
  cancelada: "text-red-500",
  completada: "text-slate-400",
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHourLabel(hour: number): string {
  if (hour === 12) return "12:00 PM";
  return hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
}

type AppointmentFormState = {
  date: string;
  hour: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  serviceId: string;
  chairId: string;
  status: AppointmentStatus;
  notes: string;
};

const EMPTY_FORM: AppointmentFormState = {
  date: "",
  hour: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  serviceId: "",
  chairId: "",
  status: "pendiente",
  notes: "",
};

export default function AppointmentsAdmin() {
  const { appointments, loading, createAppointment, updateAppointment, deleteAppointment } =
    useAppointments();
  const { chairs } = useChairs();
  const { services } = useServices();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AppointmentFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const chairLabelById = useMemo(() => new Map(chairs.map((c) => [c.id, c.label])), [chairs]);

  const sortedAppointments = useMemo(
    () =>
      [...appointments].sort((a, b) => {
        const dateCompare = a.date.getTime() - b.date.getTime();
        return dateCompare !== 0 ? dateCompare : a.hour - b.hour;
      }),
    [appointments]
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (appointment: Appointment) => {
    setEditingId(appointment.id);
    setForm({
      date: format(appointment.date, "yyyy-MM-dd"),
      hour: String(appointment.hour),
      firstName: appointment.client.firstName,
      lastName: appointment.client.lastName,
      phone: appointment.client.phone,
      email: appointment.client.email ?? "",
      serviceId: appointment.service.id,
      chairId: appointment.chairId,
      status: appointment.status,
      notes: appointment.notes ?? "",
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedService = services.find((s) => s.id === form.serviceId);
    if (!selectedService) {
      alert("Elige un servicio para la cita.");
      return;
    }

    setSaving(true);
    try {
      const client = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        ...(form.email ? { email: form.email } : {}),
      };
      const service = {
        id: selectedService.id,
        name: selectedService.name,
        duration: selectedService.duration,
        price: selectedService.price,
      };
      const date = new Date(`${form.date}T00:00:00`);
      const hour = parseInt(form.hour, 10);

      if (editingId) {
        await updateAppointment(editingId, {
          date,
          hour,
          chairId: form.chairId,
          status: form.status,
          notes: form.notes || undefined,
          client,
          service,
        });
      } else {
        await createAppointment({
          date,
          hour,
          client,
          service,
          notes: form.notes || undefined,
        });
      }
      setOpen(false);
    } catch (err) {
      alert(
        `Error al guardar la cita: ${err instanceof Error ? err.message : "Error desconocido"}`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (appointment: Appointment) => {
    if (
      !confirm(
        `¿Eliminar la cita de ${appointment.client.firstName} ${appointment.client.lastName}? Esta acción no se puede deshacer.`
      )
    )
      return;
    try {
      await deleteAppointment(appointment.id);
    } catch (err) {
      alert(`Error al eliminar la cita: ${err instanceof Error ? err.message : "Error desconocido"}`);
    }
  };

  return (
    <Card className="border-none shadow-2xl shadow-pink-200/20 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
      <CardHeader className="border-b border-pink-50/50 pb-6">
        <CardTitle className="text-pink-700 font-light text-2xl">Citas</CardTitle>
        <CardDescription>Agrega, edita o elimina las citas de tus clientes.</CardDescription>
        <CardAction>
          <Button
            onClick={openCreate}
            className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
          >
            + Nueva cita
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="p-6">
        {loading && appointments.length === 0 ? (
          <p className="text-center text-slate-400 py-8">Cargando...</p>
        ) : sortedAppointments.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No hay citas registradas.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Silla</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="capitalize">
                    {format(appointment.date, "d MMM yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>{formatHourLabel(appointment.hour)}</TableCell>
                  <TableCell className="font-medium">
                    {appointment.client.firstName} {appointment.client.lastName}
                  </TableCell>
                  <TableCell>{appointment.client.phone}</TableCell>
                  <TableCell>{appointment.service.name}</TableCell>
                  <TableCell>{chairLabelById.get(appointment.chairId) ?? appointment.chairId}</TableCell>
                  <TableCell className={STATUS_COLORS[appointment.status]}>
                    {STATUS_LABELS[appointment.status]}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(appointment)}>
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(appointment)}>
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-pink-700 font-light text-xl">
              {editingId ? "Editar cita" : "Nueva cita"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appt-date">Fecha *</Label>
                <Input
                  id="appt-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appt-hour">Hora *</Label>
                <Select value={form.hour} onValueChange={(value) => setForm({ ...form, hour: value })}>
                  <SelectTrigger id="appt-hour" className="w-full">
                    <SelectValue placeholder="Elige una hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map((hour) => (
                      <SelectItem key={hour} value={String(hour)}>
                        {formatHourLabel(hour)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appt-first-name">Nombre(s) *</Label>
                <Input
                  id="appt-first-name"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appt-last-name">Apellido(s) *</Label>
                <Input
                  id="appt-last-name"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appt-phone">Celular *</Label>
                <Input
                  id="appt-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appt-email">
                  Correo <span className="text-slate-400 font-normal">(opcional)</span>
                </Label>
                <Input
                  id="appt-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appt-service">Servicio *</Label>
              <Select
                value={form.serviceId}
                onValueChange={(value) => setForm({ ...form, serviceId: value })}
              >
                <SelectTrigger id="appt-service" className="w-full">
                  <SelectValue placeholder="Elige un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                      {!service.active ? " (inactivo)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {editingId ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appt-chair">Silla</Label>
                  <Select
                    value={form.chairId}
                    onValueChange={(value) => setForm({ ...form, chairId: value })}
                  >
                    <SelectTrigger id="appt-chair" className="w-full">
                      <SelectValue placeholder="Elige una silla" />
                    </SelectTrigger>
                    <SelectContent>
                      {chairs.map((chair) => (
                        <SelectItem key={chair.id} value={chair.id}>
                          {chair.label}
                          {!chair.active ? " (inactiva)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appt-status">Estado</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value) => setForm({ ...form, status: value as AppointmentStatus })}
                  >
                    <SelectTrigger id="appt-status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                La silla se asigna automáticamente según la disponibilidad de ese horario.
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="appt-notes">
                Notas <span className="text-slate-400 font-normal">(opcional)</span>
              </Label>
              <Textarea
                id="appt-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={saving} className="bg-pink-500 hover:bg-pink-600 text-white">
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
