export class ServerNotRespondingError extends Error {
  title: string;

  constructor() {
    super(
      "No se pudo conectar al servidor. Por favor, inténtalo de nuevo más tarde."
    );
    this.name = "ServerNotRespondingError";
    this.title = "Error de conexión";
  }
}
