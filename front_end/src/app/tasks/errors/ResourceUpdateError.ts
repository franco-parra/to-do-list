import { Task } from "../types/task";

export class ResourceUpdateError extends Error {
  title: string;
  resource: any;

  constructor(resource: any) {
    super(
      "No fue posible actualizar el recurso debido a que no existe o no se cuentan con los permisos adecuados."
    );
    this.name = "ResourceUpdateError";
    this.title = "Error al tratar de actualizar el recurso.";
    this.resource = resource;
  }
}
