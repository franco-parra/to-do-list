export class ResourceCreationError extends Error {
  title: string;
  resource: any;

  constructor(resource: any) {
    super(
      "No fue posible crear el recurso debido a que no existe o no se cuentan con los permisos adecuados."
    );
    this.name = "ResourceCreationError";
    this.title = "Error al tratar de crear el recurso.";
    this.resource = resource;
  }
}
