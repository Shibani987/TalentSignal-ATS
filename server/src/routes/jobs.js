import { Router } from 'express';
import { body, query } from 'express-validator';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { AppError, asyncHandler } from '../utils/errors.js';

export const jobsRouter = Router();

const jobValidators = [
  body('title').trim().isLength({ min: 3 }),
  body('company').trim().isLength({ min: 2 }),
  body('location').trim().isLength({ min: 2 }),
  body('workMode').optional().isIn(['remote', 'hybrid', 'onsite']),
  body('employmentType').optional().isIn(['full-time', 'part-time', 'contract', 'internship']),
  body('description').trim().isLength({ min: 20 }),
  body('experienceRequirements').trim().isLength({ min: 3 }),
  body('requiredSkills').optional().isArray()
];

jobsRouter.get('/public', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], validate, asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const filter = { status: 'published' };
  if (req.query.q) filter.$text = { $search: req.query.q };
  if (req.query.workMode) filter.workMode = req.query.workMode;
  if (req.query.employmentType) filter.employmentType = req.query.employmentType;
  const [items, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Job.countDocuments(filter)
  ]);
  res.json({ items, page, total, pages: Math.ceil(total / limit) });
}));

jobsRouter.get('/mine', requireAuth, requireRole('recruiter'), asyncHandler(async (req, res) => {
  const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 });
  const counts = await Application.aggregate([
    { $match: { recruiter: req.user._id } },
    { $group: { _id: '$job', count: { $sum: 1 } } }
  ]);
  const byJob = new Map(counts.map((c) => [c._id.toString(), c.count]));
  res.json({ items: jobs.map((job) => ({ ...job.toObject(), applicationCount: byJob.get(job._id.toString()) || 0 })) });
}));

jobsRouter.post('/', requireAuth, requireRole('recruiter'), jobValidators, validate, asyncHandler(async (req, res) => {
  const job = await Job.create({ ...req.body, recruiter: req.user._id });
  res.status(201).json({ job });
}));

jobsRouter.get('/:id', asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('recruiter', 'name company');
  if (!job) throw new AppError('Job not found', 404);
  res.json({ job });
}));

jobsRouter.put('/:id', requireAuth, requireRole('recruiter'), jobValidators, validate, asyncHandler(async (req, res) => {
  const job = await Job.findOneAndUpdate({ _id: req.params.id, recruiter: req.user._id }, req.body, { new: true });
  if (!job) throw new AppError('Job not found', 404);
  res.json({ job });
}));

jobsRouter.patch('/:id/status', requireAuth, requireRole('recruiter'), [
  body('status').isIn(['draft', 'published', 'archived'])
], validate, asyncHandler(async (req, res) => {
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, recruiter: req.user._id },
    { status: req.body.status },
    { new: true }
  );
  if (!job) throw new AppError('Job not found', 404);
  res.json({ job });
}));
