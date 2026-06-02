import { AppointmentRepository } from "../../domain/interfaces/AppointmentRepository";
import { Appointment } from "../../domain/entities/Appointment";

export class GetAppointmentsUseCase {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(): Promise<Appointment[]> {
    return await this.appointmentRepository.findAll();
  }

  async executeByDate(date: Date): Promise<Appointment[]> {
    return await this.appointmentRepository.findByDate(date);
  }
}
