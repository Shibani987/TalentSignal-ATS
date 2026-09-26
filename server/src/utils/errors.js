export class AppError extends Error {
  constructor(message, status = 500, details = undefined) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const payload = {
    error: {
      message: status >= 500 ? 'Internal server error' : err.message,
      details: err.details
    }
  };
  if (process.env.NODE_ENV !== 'production' && status >= 500) {
    payload.error.message = err.message;
  }
  res.status(status).json(payload);
}
