"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { format, isSameDay, startOfDay, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/presentation/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/ui/card";
import { Button } from "@/presentation/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/ui/select";
import { Label } from "@/presentation/ui/label";
import { Input } from "@/presentation/ui/input";
import { cn } from "@/lib/utils";
import { useAppointments } from "@/presentation/hooks/useAppointments";
import { useServices } from "@/presentation/hooks/useServices";
import { useChairs } from "@/presentation/hooks/useChairs";
import { useDaySchedules } from "@/presentation/hooks/useDaySchedules";
import { DaySchedule } from "@/domain/entities/DaySchedule";

// Configuración del Salón (usada como respaldo si aún no hay datos de admin)
const DEFAULT_MAX_CHAIRS = 3;

// Horas de atención por default: abre 9:00 AM, cierra 4:00 PM (16h). Un día
// puede sobreescribir la hora de apertura/cierre (ej. 11am - 7pm) o cerrar
// por completo desde el panel de admin (day_schedules).
const DEFAULT_BUSINESS_OPEN_HOUR = 9;
const DEFAULT_BUSINESS_CLOSE_HOUR = 16;

function formatHourLabel(hour: number): string {
  if (hour === 12) return "12 PM";
  return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
}

export default function BookingSystem() {
  const { appointments, createAppointment, loading } = useAppointments();
  const { services } = useServices();
  const { chairs } = useChairs();
  const { schedules } = useDaySchedules();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedHour, setSelectedHour] = useState<string>("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [isSuccess, setIsSuccess] = useState(false);

  const selectedService = useMemo(() =>
    services.find(s => s.id === selectedServiceId),
    [services, selectedServiceId]
  );

  const scheduleByDate = useMemo(
    () => new Map(schedules.map((s) => [s.date, s])),
    [schedules]
  );

  const getScheduleForDate = React.useCallback(
    (date: Date): DaySchedule | undefined => scheduleByDate.get(format(date, "yyyy-MM-dd")),
    [scheduleByDate]
  );

  // Un día está cerrado si es domingo, ya pasó, o el admin lo marcó como cerrado.
  const isDayClosed = React.useCallback(
    (date: Date) => {
      if (date < startOfDay(new Date())) return true;
      if (date.getDay() === 0) return true;
      return getScheduleForDate(date)?.isClosed ?? false;
    },
    [getScheduleForDate]
  );

  const getOpenHourForDate = React.useCallback(
    (date: Date) => getScheduleForDate(date)?.openHour ?? DEFAULT_BUSINESS_OPEN_HOUR,
    [getScheduleForDate]
  );

  const getCloseHourForDate = React.useCallback(
    (date: Date) => getScheduleForDate(date)?.closeHour ?? DEFAULT_BUSINESS_CLOSE_HOUR,
    [getScheduleForDate]
  );

  const getMaxChairsForDate = React.useCallback(
    (date: Date) => {
      const override = getScheduleForDate(date)?.chairsAvailable;
      if (override != null) return override;
      return chairs.length > 0 ? chairs.filter((c) => c.active).length : DEFAULT_MAX_CHAIRS;
    },
    [getScheduleForDate, chairs]
  );

  const getBusinessHoursForDate = React.useCallback(
    (date: Date) => {
      const openHour = getOpenHourForDate(date);
      const closeHour = getCloseHourForDate(date);
      return Array.from(
        { length: Math.max(closeHour - openHour, 0) },
        (_, i) => openHour + i
      );
    },
    [getOpenHourForDate, getCloseHourForDate]
  );

  // Obtener cuántas sillas están ocupadas en cada hora para una fecha
  const getChairOccupancyForDate = React.useCallback((date: Date) => {
    const dayAppointments = appointments.filter((app) =>
      isSameDay(app.date, date)
    );

    const occupancy: Record<number, number> = {};
    dayAppointments.forEach(app => {
      for (let i = 0; i < app.service.duration; i++) {
        const h = app.hour + i;
        occupancy[h] = (occupancy[h] || 0) + 1;
      }
    });
    return occupancy;
  }, [appointments]);

  // Lógica para determinar el estado de un día
  const getDayStatus = React.useCallback((date: Date) => {
    const occupancy = getChairOccupancyForDate(date);
    const hours = getBusinessHoursForDate(date);
    const maxChairs = getMaxChairsForDate(date);
    const hasAnyBooking = hours.some(h => (occupancy[h] || 0) > 0);
    if (!hasAnyBooking) return "available";

    const allHoursFull = hours.every(h => (occupancy[h] || 0) >= maxChairs);
    if (allHoursFull) return "full";

    return "partial";
  }, [getChairOccupancyForDate, getBusinessHoursForDate, getMaxChairsForDate]);

  const modifiers = useMemo(() => {
    const full: Date[] = [];
    const available: Date[] = [];

    for (let i = 0; i < 90; i++) {
      const day = addDays(startOfDay(new Date()), i);
      if (isDayClosed(day)) continue;

      const status = getDayStatus(day);
      if (status === "full") full.push(day);
      else available.push(day);
    }

    return { full, available };
  }, [getDayStatus, isDayClosed]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedHour || !firstName || !lastName || !phone || !selectedService) return;

    try {
      await createAppointment({
        date: selectedDate,
        hour: parseInt(selectedHour),
        client: { firstName, lastName, phone, ...(email ? { email } : {}) },
        service: selectedService,
      });

      setSelectedHour("");
      setSelectedServiceId("");
      setFirstName("");
      setLastName("");
      setPhone("");
      setEmail("");
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      alert("Error al agendar cita: " + (err instanceof Error ? err.message : "Error desconocido"));
    }
  };

  const availableHours = useMemo(() => {
    if (!selectedDate || !selectedService) return [];
    const occupancy = getChairOccupancyForDate(selectedDate);
    const hours = getBusinessHoursForDate(selectedDate);
    const closeHour = getCloseHourForDate(selectedDate);
    const maxChairs = getMaxChairsForDate(selectedDate);

    return hours.filter((hour) => {
      // La cita nunca debe terminar después de la hora de cierre de ese día.
      if (hour + selectedService.duration > closeHour) return false;

      for (let i = 0; i < selectedService.duration; i++) {
        const currentHour = hour + i;
        if ((occupancy[currentHour] || 0) >= maxChairs) {
          return false;
        }
      }
      return true;
    });
  }, [
    selectedDate,
    selectedService,
    getChairOccupancyForDate,
    getBusinessHoursForDate,
    getCloseHourForDate,
    getMaxChairsForDate,
  ]);

  const selectedDateBusinessHours = useMemo(
    () => (selectedDate ? getBusinessHoursForDate(selectedDate) : []),
    [selectedDate, getBusinessHoursForDate]
  );
  const selectedDateMaxChairs = selectedDate ? getMaxChairsForDate(selectedDate) : DEFAULT_MAX_CHAIRS;
  const selectedDateClosed = selectedDate ? isDayClosed(selectedDate) : false;

  return (
    <div className="min-h-screen bg-[#fff1f2] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="relative text-center space-y-2 py-8">
          <Link
            href="/admin"
            className="absolute right-0 top-8 text-xs font-medium text-pink-300 hover:text-pink-500 transition-colors uppercase tracking-wider"
          >
            Panel Admin
          </Link>
          <h1 className="text-5xl font-extralight text-pink-600 tracking-tighter">
            Vanessa Gonzalez
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-pink-200" />
            <p className="text-pink-400 uppercase tracking-[0.3em] text-xs font-medium">
              Studio de Belleza
            </p>
            <div className="h-px w-12 bg-pink-200" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <Card className="lg:col-span-7 border-none shadow-2xl shadow-pink-200/20 bg-white/80 backdrop-blur-sm overflow-hidden rounded-3xl">
            <CardHeader className="border-b border-pink-50/50 pb-6">
              <CardTitle className="text-pink-700 font-light text-2xl">Calendario de Citas</CardTitle>
              <CardDescription className="flex gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-xs">
                  <span className="w-3 h-3 rounded-full bg-green-100 border border-green-200" /> Disponible
                </span>
                <span className="flex items-center gap-1.5 text-xs">
                  <span className="w-3 h-3 rounded-full bg-red-100 border border-red-200" /> Lleno
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={es}
                disabled={isDayClosed}
                modifiers={modifiers}
                modifiersClassNames={{
                  full: "!bg-red-100 !text-red-700 hover:!bg-red-200 rounded-full",
                  available: "!bg-green-50 !text-green-700 hover:!bg-green-100 rounded-full",
                }}
                className="p-0 scale-110 transition-transform origin-top"
                classNames={{
                  month_caption: "text-lg font-medium text-pink-700 mb-4",
                  weekday: "text-pink-400 font-medium w-14",
                  day: "text-base h-14 w-14",
                }}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-5 border-none shadow-2xl shadow-pink-200/20 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden relative">
            {isSuccess && (
              <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-light text-pink-700 mb-2">¡Cita Agendada!</h3>
                <p className="text-slate-500 text-sm">Tu espacio ha sido reservado con éxito.</p>
              </div>
            )}
            
            <CardHeader className="border-b border-pink-50/50 pb-6">
              <CardTitle className="text-pink-700 font-light text-2xl">Detalles de la Cita</CardTitle>
              <CardDescription className="text-pink-400 font-medium">
                {selectedDate
                  ? format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })
                  : "Selecciona una fecha"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {selectedDate && selectedDateClosed && (
                <p className="text-center text-red-500 font-medium py-8">
                  El negocio no abre este día. Elige otra fecha.
                </p>
              )}
              {selectedDate && !selectedDateClosed && (
                <form onSubmit={handleBooking} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="firstName" className="text-pink-900 font-medium ml-1">Nombre(s) *</Label>
                      <Input
                        id="firstName"
                        placeholder="Ej. Sofia"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="h-12 border-pink-100 focus:ring-pink-200 focus:border-pink-300 rounded-xl bg-white/50"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="lastName" className="text-pink-900 font-medium ml-1">Apellido(s) *</Label>
                      <Input
                        id="lastName"
                        placeholder="Ej. Rodriguez"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="h-12 border-pink-100 focus:ring-pink-200 focus:border-pink-300 rounded-xl bg-white/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-pink-900 font-medium ml-1">Celular *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Ej. 1234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      className="h-12 border-pink-100 focus:ring-pink-200 focus:border-pink-300 rounded-xl bg-white/50"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-pink-900 font-medium ml-1">
                      Correo Electrónico{" "}
                      <span className="text-pink-300 font-normal normal-case">(opcional)</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Ej. sofia@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 border-pink-100 focus:ring-pink-200 focus:border-pink-300 rounded-xl bg-white/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="service" className="text-pink-900 font-medium ml-1">Tipo de Servicio *</Label>
                      <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                        <SelectTrigger id="service" className="h-12 border-pink-100 focus:ring-pink-200 rounded-xl bg-white/50">
                          <SelectValue placeholder="Servicio" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-pink-100">
                          {services.filter((service) => service.active).map((service) => (
                            <SelectItem key={service.id} value={service.id} className="focus:bg-pink-50 focus:text-pink-700">
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="hour" className="text-pink-900 font-medium ml-1">Hora de Preferencia *</Label>
                      <Select value={selectedHour} onValueChange={setSelectedHour} disabled={!selectedServiceId}>
                        <SelectTrigger id="hour" className="h-12 border-pink-100 focus:ring-pink-200 rounded-xl bg-white/50">
                          <SelectValue placeholder={selectedServiceId ? "Horario" : "---"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-pink-100">
                          {availableHours.length > 0 ? (
                            availableHours.map((hour) => (
                              <SelectItem key={hour} value={hour.toString()} className="focus:bg-pink-50 focus:text-pink-700">
                                {hour === 12 ? "12:00 PM" : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-4 text-sm text-red-500 text-center font-medium">
                              {selectedServiceId 
                                ? "Sin disponibilidad"
                                : "Elige un servicio"}
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 bg-pink-500 hover:bg-pink-600 text-white transition-all duration-150 active:scale-[0.96] active:bg-pink-700 rounded-xl shadow-lg shadow-pink-200 font-medium text-lg"
                    disabled={!selectedHour || !firstName || !lastName || !phone || !selectedServiceId}
                  >
                    Confirmar Reserva
                  </Button>
                </form>
              )}

              {!selectedDateClosed && (
                <div className="pt-8 border-t border-pink-50/50">
                  <h3 className="text-sm font-semibold text-pink-900 mb-5 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                    Estado del Horario ({formatHourLabel(getOpenHourForDate(selectedDate!))} - {formatHourLabel(getCloseHourForDate(selectedDate!))}
                    {selectedDateMaxChairs !== DEFAULT_MAX_CHAIRS ? ` · ${selectedDateMaxChairs} silla${selectedDateMaxChairs === 1 ? "" : "s"}` : ""})
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {selectedDateBusinessHours.map((hour) => {
                      const occupancy = getChairOccupancyForDate(selectedDate!);
                      const isFull = (occupancy[hour] || 0) >= selectedDateMaxChairs;
                      return (
                        <div
                          key={hour}
                          className={cn(
                            "py-3 px-1 text-[11px] font-medium text-center rounded-xl border transition-all duration-200 shadow-sm",
                            isFull
                              ? "bg-red-50 border-red-100 text-red-600 shadow-red-50"
                              : "bg-green-50 border-green-100 text-green-600 shadow-green-50"
                          )}
                        >
                          {formatHourLabel(hour)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <footer className="text-center pb-12">
          <p className="text-pink-300 text-xs font-light">
            &copy; 2026 Vanessa Gonzalez Studio. Todos los derechos reservados.
          </p>
        </footer>
      </div>
    </div>
  );
}
