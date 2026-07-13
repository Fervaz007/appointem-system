import { Service } from "../entities/Service";

export interface ServiceRepository {
  findAll(): Promise<Service[]>;
  findById(id: string): Promise<Service | null>;
  create(service: Service): Promise<Service>;
  update(id: string, service: Partial<Service>): Promise<Service>;
  delete(id: string): Promise<void>;
}
