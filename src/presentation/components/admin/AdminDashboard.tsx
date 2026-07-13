"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/presentation/ui/tabs";
import ServicesAdmin from "./ServicesAdmin";
import ChairsAdmin from "./ChairsAdmin";
import ScheduleAdmin from "./ScheduleAdmin";
import AppointmentsAdmin from "./AppointmentsAdmin";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#fff1f2] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4 py-8">
          <div>
            <h1 className="text-4xl font-extralight text-pink-600 tracking-tighter">
              Panel de Administración
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="h-px w-12 bg-pink-200" />
              <p className="text-pink-400 uppercase tracking-[0.3em] text-xs font-medium">
                Vanessa Gonzalez Studio
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-pink-500 hover:text-pink-700 transition-colors"
          >
            ← Volver al sitio
          </Link>
        </header>

        <Tabs defaultValue="services">
          <TabsList className="bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 h-auto shadow-lg shadow-pink-200/20">
            <TabsTrigger value="services" className="rounded-xl px-4 py-2 text-sm">
              Servicios
            </TabsTrigger>
            <TabsTrigger value="chairs" className="rounded-xl px-4 py-2 text-sm">
              Sillas
            </TabsTrigger>
            <TabsTrigger value="schedule" className="rounded-xl px-4 py-2 text-sm">
              Horarios
            </TabsTrigger>
            <TabsTrigger value="appointments" className="rounded-xl px-4 py-2 text-sm">
              Citas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="mt-6">
            <ServicesAdmin />
          </TabsContent>
          <TabsContent value="chairs" className="mt-6">
            <ChairsAdmin />
          </TabsContent>
          <TabsContent value="schedule" className="mt-6">
            <ScheduleAdmin />
          </TabsContent>
          <TabsContent value="appointments" className="mt-6">
            <AppointmentsAdmin />
          </TabsContent>
        </Tabs>

        <footer className="text-center pb-12">
          <p className="text-pink-300 text-xs font-light">
            &copy; 2026 Vanessa Gonzalez Studio. Todos los derechos reservados.
          </p>
        </footer>
      </div>
    </div>
  );
}
