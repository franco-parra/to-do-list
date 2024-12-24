export class ResourceDeletionError extends Error {
  title: string;

  constructor() {
    super(
      "No fue posible eliminar el recurso debido a que no existe o no se cuentan con los permisos adecuados."
    );
    this.name = "ResourceDeletionError";
    this.title = "Error al tratar de eliminar el recurso.";
  }
}
