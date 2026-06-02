import { CreateAppointmentUseCase } from "../application/appointments/CreateAppointment";
import { GetAppointmentsUseCase } from "../application/appointments/GetAppointments";
import { inMemoryAppointmentRepository } from "./repositories/InMemoryAppointmentRepository";

// Repositorio
const appointmentRepository = inMemoryAppointmentRepository;

// Casos de Uso
export const createAppointmentUseCase = new CreateAppointmentUseCase(appointmentRepository);
export const getAppointmentsUseCase = new GetAppointmentsUseCase(appointmentRepository);
