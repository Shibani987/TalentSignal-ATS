import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { User } from '../models/User.js';
import { signToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { AppError, asyncHandler } from '../utils/errors.js';

export const authRouter = Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false });

authRouter.post('/register', authLimiter, [
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('role').isIn(['recruiter', 'applicant'])
], validate, asyncHandler(async (req, res) => {
  const existing = await User.findOne({ email: req.body.email });
  if (existing) throw new AppError('An account with this email already exists', 409);
  const passwordHash = await User.hashPassword(req.body.password);
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    passwordHash,
    company: req.body.role === 'recruiter' ? { name: req.body.companyName || '' } : undefined
  });
  res.status(201).json({ token: signToken(user), user: user.toSafeJSON() });
}));

authRouter.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], validate, asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new AppError('Invalid email or password', 401);
  }
  res.json({ token: signToken(user), user: user.toSafeJSON() });
}));
