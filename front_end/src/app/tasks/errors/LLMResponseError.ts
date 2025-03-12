export class LLMResponseError extends Error {
  title: string;

  constructor() {
    super(
      "No fue posible generar una respuesta válida debido a un error interno en el modelo de lenguaje."
    );
    this.name = "LLMResponseError";
    this.title = "Error al tratar de generar una respuesta válida.";
  }
}
