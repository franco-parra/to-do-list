export class UnexpectedError extends Error {
  title: string;

  constructor(message: string) {
    super(`Algo inesperado sucedió. Detalles: ${message}`);
    this.name = "UnexpectedError";
    this.title = "Error inesperado";
  }
}
