// Fragmento de RUTEANDO. © Fernando Melendez. Todos los derechos reservados.
//
// Middleware de error central: toda respuesta de error sigue RFC 9457
// (Problem Details). Nunca un stack trace hacia el cliente; el detalle
// técnico queda solo en el registro del servidor.
function errorHandler(err, req, res, next) {
  const isKnown = err instanceof ProblemDetailsError;
  const problem = isKnown
    ? err.toProblemDetails()
    : {
        type: 'about:blank',
        title: 'Error interno del servidor',
        status: 500,
        detail: 'Ocurrió un error inesperado.',
      };

  if (!problem.instance) problem.instance = req.originalUrl;

  if (isKnown) req.log?.warn({ err }, problem.title);
  else req.log?.error({ err }, 'Error no controlado');

  res.status(problem.status).type('application/problem+json').send(problem);
}
