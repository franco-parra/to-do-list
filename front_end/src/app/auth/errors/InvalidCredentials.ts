export class InvalidCredentials extends Error {
  title: string;

  constructor() {
    super("El usuario y/o la contraseña son inválidos.");
    this.name = "InvalidCredentials";
    this.title = "Error al tratar de iniciar sesión";
  }
}
