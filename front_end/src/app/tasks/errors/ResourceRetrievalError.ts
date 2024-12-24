export class ResourceRetrievalError extends Error {
  title: string;

  constructor() {
    super(
      "No fue posible recuperar el recurso debido a que no existe o no se cuentan con los permisos adecuados."
    );
    this.name = "ResourceRetrievalError";
    this.title = "Error al tratar de recuperar el recurso.";
  }
}
