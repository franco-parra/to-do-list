export class ValidationError extends Error {
  errors: { [key: string]: string[] };

  constructor(errors: { [key: string]: string[] }) {
    super("Uno o más campos fueron rechazados debido a sus formatos.");
    this.name = "ValidationError";
    this.errors = errors;
  }
}
