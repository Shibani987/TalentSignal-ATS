import { validationResult } from 'express-validator';
import { AppError } from '../utils/errors.js';

export function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(new AppError('Validation failed', 400, result.array()));
  }
  next();
}
