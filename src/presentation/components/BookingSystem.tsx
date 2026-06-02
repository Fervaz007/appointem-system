"use client";

import React, { useState, useMemo } from "react";
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
import { SERVICES } from "@/domain/entities/Service";

// Configuración del Salón
const MAX_CHAIRS = 3;

// Horas de atención (9:00 AM a 4:00 PM)
const BUSINESS_HOURS = [9, 10, 11, 12, 13, 14, 15, 16];

export default function BookingSystem() {
  const { appointments, createAppointment, loading } = useAppointments();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedHour, setSelectedHour] = useState<string>("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [isSuccess, setIsSuccess] = useState(false);

  const selectedService = useMemo(() => 
    SERVICES.find(s => s.id === selectedServiceId), 
    [selectedServiceId]
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
    const hasAnyBooking = BUSINESS_HOURS.some(h => (occupancy[h] || 0) > 0);
    if (!hasAnyBooking) return "available";

    const allHoursFull = BUSINESS_HOURS.every(h => (occupancy[h] || 0) >= MAX_CHAIRS);
    if (allHoursFull) return "full";

    return "partial";
  }, [getChairOccupancyForDate]);

  const modifiers = useMemo(() => {
    const full: Date[] = [];
    const available: Date[] = [];

    for (let i = 0; i < 90; i++) {
      const day = addDays(startOfDay(new Date()), i);
      const status = getDayStatus(day);
      if (status === "full") full.push(day);
      else available.push(day);
    }

    return { full, available };
  }, [getDayStatus]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedHour || !firstName || !lastName || !phone || !selectedService) return;

    try {
      await createAppointment({
        date: selectedDate,
        hour: parseInt(selectedHour),
        client: { firstName, lastName, phone },
        service: selectedService,
      });

      setSelectedHour("");
      setSelectedServiceId("");
      setFirstName("");
      setLastName("");
      setPhone("");
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      alert("Error al agendar cita: " + (err instanceof Error ? err.message : "Error desconocido"));
    }
  };

  const availableHours = useMemo(() => {
    if (!selectedDate || !selectedService) return [];
    const occupancy = getChairOccupancyForDate(selectedDate);
    
    return BUSINESS_HOURS.filter((hour) => {
      for (let i = 0; i < selectedService.duration; i++) {
        const currentHour = hour + i;
        if (!BUSINESS_HOURS.includes(currentHour) || (occupancy[currentHour] || 0) >= MAX_CHAIRS) {
          return false;
        }
      }
      return true;
    });
  }, [selectedDate, selectedService, getChairOccupancyForDate]);

  return (
    <div className="min-h-screen bg-[#fff1f2] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-2 py-8">
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
                disabled={{ before: startOfDay(new Date()) }}
                modifiers={modifiers}
                modifiersClassNames={{
                  full: "!bg-red-100 !text-red-700 hover:!bg-red-200 rounded-full",
                  available: "!bg-green-50 !text-green-700 hover:!bg-green-100 rounded-full",
                }}
                className="p-0 scale-105 transition-transform origin-top"
                classNames={{
                  month_caption: "text-lg font-medium text-pink-700 mb-4",
                  weekday: "text-pink-400 font-medium w-12",
                  day: "text-base h-12 w-12",
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
              {selectedDate && (
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="service" className="text-pink-900 font-medium ml-1">Tipo de Servicio *</Label>
                      <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                        <SelectTrigger id="service" className="h-12 border-pink-100 focus:ring-pink-200 rounded-xl bg-white/50">
                          <SelectValue placeholder="Servicio" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-pink-100">
                          {SERVICES.map((service) => (
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
                    className="w-full h-14 bg-pink-500 hover:bg-pink-600 text-white transition-all duration-300 rounded-xl shadow-lg shadow-pink-200 font-medium text-lg"
                    disabled={!selectedHour || !firstName || !lastName || !phone || !selectedServiceId}
                  >
                    Confirmar Reserva
                  </Button>
                </form>
              )}

              <div className="pt-8 border-t border-pink-50/50">
                <h3 className="text-sm font-semibold text-pink-900 mb-5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                  Estado del Horario (9 AM - 4 PM)
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {BUSINESS_HOURS.map((hour) => {
                    const occupancy = getChairOccupancyForDate(selectedDate!);
                    const isFull = (occupancy[hour] || 0) >= MAX_CHAIRS;
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
                        {hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                      </div>
                    );
                  })}
                </div>
              </div>
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
