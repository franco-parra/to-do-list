export class InternalServerError extends Error {
  title: string;

  constructor() {
    super("El servidor no ha respondido adecuadamente.");
    this.name = "InternalServerError";
    this.title = "Algo salió mal";
  }
}
