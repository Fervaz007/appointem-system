export class ChairConflictError extends Error {
  constructor(message = "La silla ya fue reservada para ese horario") {
    super(message);
    this.name = "ChairConflictError";
  }
}
