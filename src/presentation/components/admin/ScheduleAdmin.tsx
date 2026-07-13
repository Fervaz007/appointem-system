"use client";

import { useState } from "react";
import { format, addDays } from "date-fns";
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
import { Switch } from "@/presentation/ui/switch";
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
import { useDaySchedules } from "@/presentation/hooks/useDaySchedules";
import { DaySchedule } from "@/domain/entities/DaySchedule";

const MAX_RANGE_DAYS = 31;

type ScheduleFormState = {
  date: string;
  endDate: string;
  isClosed: boolean;
  openHour: string;
  closeHour: string;
  chairsAvailable: string;
};

const EMPTY_FORM: ScheduleFormState = {
  date: "",
  endDate: "",
  isClosed: false,
  openHour: "",
  closeHour: "",
  chairsAvailable: "",
};

function parseDateStr(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

function getDatesInRange(startStr: string, endStr: string): string[] {
  const start = parseDateStr(startStr);
  const end = parseDateStr(endStr);
  const dates: string[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) {
    dates.push(format(d, "yyyy-MM-dd"));
  }
  return dates;
}

export default function ScheduleAdmin() {
  const { schedules, loading, upsertSchedule, deleteSchedule } = useDaySchedules();
  const [open, setOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [form, setForm] = useState<ScheduleFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const sortedSchedules = [...schedules].sort((a, b) => a.date.localeCompare(b.date));

  const openCreate = () => {
    setEditingDate(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (schedule: DaySchedule) => {
    setEditingDate(schedule.date);
    setForm({
      date: schedule.date,
      endDate: "",
      isClosed: schedule.isClosed,
      openHour: schedule.openHour != null ? String(schedule.openHour) : "",
      closeHour: schedule.closeHour != null ? String(schedule.closeHour) : "",
      chairsAvailable: schedule.chairsAvailable != null ? String(schedule.chairsAvailable) : "",
    });
    setOpen(true);
  };

  const fillWholeWeek = () => {
    if (!form.date) {
      alert("Primero elige la fecha de inicio.");
      return;
    }
    setForm({ ...form, endDate: format(addDays(parseDateStr(form.date), 6), "yyyy-MM-dd") });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dates =
      !editingDate && form.endDate && form.endDate > form.date
        ? getDatesInRange(form.date, form.endDate)
        : [form.date];

    if (dates.length > MAX_RANGE_DAYS) {
      alert(`Elige un rango de ${MAX_RANGE_DAYS} días o menos.`);
      return;
    }
    if (dates.length > 1 && !confirm(`Vas a aplicar esto a ${dates.length} días. ¿Continuar?`)) {
      return;
    }

    setSaving(true);
    try {
      for (const date of dates) {
        const schedule: DaySchedule = {
          date,
          isClosed: form.isClosed,
          openHour: form.isClosed || form.openHour.trim() === "" ? null : parseInt(form.openHour, 10),
          closeHour: form.isClosed || form.closeHour.trim() === "" ? null : parseInt(form.closeHour, 10),
          chairsAvailable:
            form.isClosed || form.chairsAvailable.trim() === "" ? null : parseInt(form.chairsAvailable, 10),
        };
        await upsertSchedule(schedule);
      }
      setOpen(false);
    } catch (err) {
      alert("No se pudo guardar el horario: " + (err instanceof Error ? err.message : "Error desconocido"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (schedule: DaySchedule) => {
    if (!confirm(`¿Quitar el horario especial del ${schedule.date}? Ese día volverá al horario normal.`)) return;
    try {
      await deleteSchedule(schedule.date);
    } catch (err) {
      alert("No se pudo quitar el horario especial: " + (err instanceof Error ? err.message : "Error desconocido"));
    }
  };

  return (
    <Card className="border-none shadow-2xl shadow-pink-200/20 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
      <CardHeader className="border-b border-pink-50/50 pb-6">
        <CardTitle className="text-pink-700 font-light text-2xl">Horarios Especiales</CardTitle>
        <CardDescription>
          Cierra uno o varios días (vacaciones), o cambia el horario de apertura/cierre y cuántas
          sillas hay disponibles. Los días que no agregues aquí usan el horario normal del salón.
        </CardDescription>
        <CardAction>
          <Button
            onClick={openCreate}
            className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
          >
            + Agregar día especial
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="p-6">
        {loading && schedules.length === 0 ? (
          <p className="text-center text-slate-400 py-8">Cargando...</p>
        ) : sortedSchedules.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No hay días con horario especial.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Apertura</TableHead>
                <TableHead>Cierre</TableHead>
                <TableHead>Sillas disponibles</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSchedules.map((schedule) => (
                <TableRow key={schedule.date}>
                  <TableCell className="font-medium capitalize">
                    {format(parseDateStr(schedule.date), "EEEE d 'de' MMMM yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>
                    {schedule.isClosed ? (
                      <span className="text-red-600">Cerrado</span>
                    ) : (
                      <span className="text-amber-600">Horario especial</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {schedule.isClosed ? "—" : schedule.openHour != null ? `${schedule.openHour}:00` : "Normal"}
                  </TableCell>
                  <TableCell>
                    {schedule.isClosed ? "—" : schedule.closeHour != null ? `${schedule.closeHour}:00` : "Normal"}
                  </TableCell>
                  <TableCell>
                    {schedule.isClosed
                      ? "—"
                      : schedule.chairsAvailable != null
                        ? schedule.chairsAvailable
                        : "Normal"}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(schedule)}>
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(schedule)}>
                      Quitar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-pink-700 font-light text-xl">
              {editingDate ? "Editar día especial" : "Nuevo día especial"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule-date">{editingDate ? "Fecha *" : "Desde *"}</Label>
                <Input
                  id="schedule-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  disabled={!!editingDate}
                  required
                />
              </div>
              {!editingDate && (
                <div className="space-y-2">
                  <Label htmlFor="schedule-end-date">
                    Hasta <span className="text-slate-400 font-normal">(opcional)</span>
                  </Label>
                  <Input
                    id="schedule-end-date"
                    type="date"
                    value={form.endDate}
                    min={form.date || undefined}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
              )}
            </div>
            {!editingDate && (
              <div className="flex items-center justify-between -mt-2">
                <p className="text-xs text-slate-400">
                  Deja &quot;Hasta&quot; vacío para un solo día, o elige una fecha final para
                  aplicarlo a varios días seguidos.
                </p>
                <Button type="button" variant="outline" size="sm" onClick={fillWholeWeek}>
                  Toda la semana
                </Button>
              </div>
            )}
            <div className="flex items-center justify-between rounded-xl border border-pink-100 px-4 py-3">
              <div>
                <Label htmlFor="schedule-closed">Cerrado todo el día</Label>
                <p className="text-xs text-slate-400">Ej. vacaciones o día festivo</p>
              </div>
              <Switch
                id="schedule-closed"
                checked={form.isClosed}
                onCheckedChange={(checked) => setForm({ ...form, isClosed: checked })}
              />
            </div>
            {!form.isClosed && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule-open-hour">
                      Hora de apertura{" "}
                      <span className="text-slate-400 font-normal">(vacío = normal)</span>
                    </Label>
                    <Input
                      id="schedule-open-hour"
                      type="number"
                      min={0}
                      max={23}
                      placeholder="ej. 11 (11 AM)"
                      value={form.openHour}
                      onChange={(e) => setForm({ ...form, openHour: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schedule-close-hour">
                      Hora de cierre{" "}
                      <span className="text-slate-400 font-normal">(vacío = normal)</span>
                    </Label>
                    <Input
                      id="schedule-close-hour"
                      type="number"
                      min={0}
                      max={23}
                      placeholder="ej. 19 (7 PM)"
                      value={form.closeHour}
                      onChange={(e) => setForm({ ...form, closeHour: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule-chairs">
                    Sillas disponibles ese día{" "}
                    <span className="text-slate-400 font-normal">(vacío = normal)</span>
                  </Label>
                  <Input
                    id="schedule-chairs"
                    type="number"
                    min={0}
                    placeholder="ej. 2"
                    value={form.chairsAvailable}
                    onChange={(e) => setForm({ ...form, chairsAvailable: e.target.value })}
                  />
                </div>
              </>
            )}
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
