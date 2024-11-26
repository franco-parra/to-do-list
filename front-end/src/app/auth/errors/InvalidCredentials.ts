export class InvalidCredentials extends Error {
  constructor() {
    super("El usuario y/o la contraseña son inválidos.");
    this.name = "InvalidCredentials";
  }
}
