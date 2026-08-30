import { z } from "zod";
import { ServiceRepository } from "../../domain/interfaces/ServiceRepository";
import { Service } from "../../domain/entities/Service";

export const CreateServiceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  duration: z.number().positive(),
  price: z.number().nonnegative(),
  active: z.boolean().default(true),
  depositAmount: z.number().nonnegative().default(0),
});

export const UpdateServiceSchema = CreateServiceSchema.partial();

export class ServiceUseCases {
  constructor(private serviceRepository: ServiceRepository) {}

  list(): Promise<Service[]> {
    return this.serviceRepository.findAll();
  }

  create(input: unknown): Promise<Service> {
    const validated = CreateServiceSchema.parse(input);
    return this.serviceRepository.create(validated);
  }

  update(id: string, input: unknown): Promise<Service> {
    const validated = UpdateServiceSchema.parse(input);
    return this.serviceRepository.update(id, validated);
  }

  remove(id: string): Promise<void> {
    return this.serviceRepository.delete(id);
  }
}
