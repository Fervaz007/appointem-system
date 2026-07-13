import { Chair } from "../entities/Chair";

export interface ChairRepository {
  findAll(): Promise<Chair[]>;
  findById(id: string): Promise<Chair | null>;
  create(chair: Chair): Promise<Chair>;
  update(id: string, chair: Partial<Chair>): Promise<Chair>;
  delete(id: string): Promise<void>;
}
