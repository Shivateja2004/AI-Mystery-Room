export class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

export function notFoundHandler(req, res) {
  res.status(404).json({ error: { code: 'ROUTE_NOT_FOUND', message: 'Route not found.' } });
}

export function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  if (error.name === 'CastError') {
    return res.status(404).json({ error: { code: 'CASE_NOT_FOUND', message: 'Case not found.' } });
  }
  if (error.name === 'ZodError') {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.issues[0]?.message || 'Invalid request.' } });
  }
  const status = error.status || 500;
  const code = error.code || 'INTERNAL_ERROR';
  const message = error.status ? error.message : 'An unexpected server error occurred.';
  if (!error.status) console.error(error);
  return res.status(status).json({ error: { code, message } });
}
