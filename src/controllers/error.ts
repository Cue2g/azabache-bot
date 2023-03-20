export function getHttpError(code:number, lang:string) {
    let message;
    switch (code) {
      case 400:
        message = 'Solicitud incorrecta.';
        break;
      case 401:
        message = 'No autorizado.';
        break;
      case 403:
        message = 'Acceso prohibido.';
        break;
      case 404:
        message = 'Recurso no encontrado.';
        break;
      case 500:
        message = 'Error interno del servidor.';
        break;
      default:
        message = 'Error desconocido.';
        break;
    }
    return {
      status: false,
      message: message
    };
  }