import { Router } from 'express';
import path from 'node:path';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../utils/errors.js';

export const filesRouter = Router();

filesRouter.get('/demo/*', requireAuth, (req, res) => {
  const decoded = decodeURIComponent(req.params[0]);
  const root = path.resolve(process.cwd(), 'uploads');
  const target = path.resolve(root, decoded);
  if (!target.startsWith(root)) throw new AppError('File not found', 404);
  res.sendFile(target);
});
