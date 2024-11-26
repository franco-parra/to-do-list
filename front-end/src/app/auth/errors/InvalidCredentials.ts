export class InvalidCredentials extends Error {
  constructor() {
    super("El usuario o la contraseña son incorrectos.");
    this.name = "InvalidCredentials";
  }
}
