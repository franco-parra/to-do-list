export class InternalServerError extends Error {
  constructor() {
    super("El servidor no ha respondido adecuadamente.");
    this.name = "InternalServerError";
  }
}
