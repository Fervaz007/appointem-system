import { z } from "zod";
import { ChairRepository } from "../../domain/interfaces/ChairRepository";
import { Chair } from "../../domain/entities/Chair";

export const CreateChairSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  active: z.boolean().default(true),
});

export const UpdateChairSchema = CreateChairSchema.partial();

export class ChairUseCases {
  constructor(private chairRepository: ChairRepository) {}

  list(): Promise<Chair[]> {
    return this.chairRepository.findAll();
  }

  create(input: unknown): Promise<Chair> {
    const validated = CreateChairSchema.parse(input);
    return this.chairRepository.create(validated);
  }

  update(id: string, input: unknown): Promise<Chair> {
    const validated = UpdateChairSchema.parse(input);
    return this.chairRepository.update(id, validated);
  }

  remove(id: string): Promise<void> {
    return this.chairRepository.delete(id);
  }
}
