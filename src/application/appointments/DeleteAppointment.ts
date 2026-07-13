import { AppointmentRepository } from "../../domain/interfaces/AppointmentRepository";

export class DeleteAppointmentUseCase {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(id: string): Promise<void> {
    await this.appointmentRepository.delete(id);
  }
}
