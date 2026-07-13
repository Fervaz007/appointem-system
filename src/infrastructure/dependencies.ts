import { CreateAppointmentUseCase } from "../application/appointments/CreateAppointment";
import { GetAppointmentsUseCase } from "../application/appointments/GetAppointments";
import { UpdateAppointmentUseCase } from "../application/appointments/UpdateAppointment";
import { DeleteAppointmentUseCase } from "../application/appointments/DeleteAppointment";
import { ServiceUseCases } from "../application/services/ServiceUseCases";
import { ChairUseCases } from "../application/chairs/ChairUseCases";
import { DayScheduleUseCases } from "../application/schedule/DayScheduleUseCases";

import { createAdminClient } from "./supabase/adminClient";
import { SupabaseAppointmentRepository } from "./repositories/SupabaseAppointmentRepository";
import { SupabaseServiceRepository } from "./repositories/SupabaseServiceRepository";
import { SupabaseChairRepository } from "./repositories/SupabaseChairRepository";
import { SupabaseDayScheduleRepository } from "./repositories/SupabaseDayScheduleRepository";

const supabase = createAdminClient();

// Repositorios
const appointmentRepository = new SupabaseAppointmentRepository(supabase);
const serviceRepository = new SupabaseServiceRepository(supabase);
const chairRepository = new SupabaseChairRepository(supabase);
const dayScheduleRepository = new SupabaseDayScheduleRepository(supabase);

// Casos de uso — Citas
export const createAppointmentUseCase = new CreateAppointmentUseCase(
  appointmentRepository,
  chairRepository,
  dayScheduleRepository
);
export const getAppointmentsUseCase = new GetAppointmentsUseCase(appointmentRepository);
export const updateAppointmentUseCase = new UpdateAppointmentUseCase(appointmentRepository);
export const deleteAppointmentUseCase = new DeleteAppointmentUseCase(appointmentRepository);

// Casos de uso — Servicios, sillas y horarios
export const serviceUseCases = new ServiceUseCases(serviceRepository);
export const chairUseCases = new ChairUseCases(chairRepository);
export const dayScheduleUseCases = new DayScheduleUseCases(dayScheduleRepository);
