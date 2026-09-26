import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { body, query } from 'express-validator';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { resumeUpload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { Application, applicationStatuses } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { User } from '../models/User.js';
import { activeAnalysisProvider, analyzeResume } from '../services/analysis.js';
import { sendInterviewEmail, sendStatusEmail } from '../services/email.js';
import { extractResumeText } from '../services/resume.js';
import { sendPrivateFile, signedResumeUrl, uploadPrivateFile } from '../services/storage.js';
import { AppError, asyncHandler } from '../utils/errors.js';

export const applicationsRouter = Router();

async function runAnalysis(applicationId) {
  const app = await Application.findById(applicationId).populate('job');
  if (!app) return;
  try {
    app.analysis.status = 'processing';
    await app.save();
    const result = await analyzeResume({ resumeText: app.resumeText, job: app.job });
    app.analysis = { ...result, status: 'succeeded', provider: activeAnalysisProvider(), analyzedAt: new Date() };
    await app.save();
  } catch (error) {
    app.analysis.status = 'failed';
    app.analysis.error = error.message;
    await app.save();
  }
}

applicationsRouter.post('/', requireAuth, requireRole('applicant'), resumeUpload.single('resume'), asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Resume file is required', 400);
  const job = await Job.findById(req.body.jobId);
  if (!job || job.status !== 'published') throw new AppError('This job is not accepting applications', 400);
  const duplicate = await Application.findOne({ job: job._id, applicant: req.user._id });
  if (duplicate) throw new AppError('You have already applied for this job', 409);
  const resumeText = await extractResumeText(req.file);
  const key = `resumes/${req.user._id}/${randomUUID()}-${req.file.originalname}`;
  await uploadPrivateFile({ key, buffer: req.file.buffer, contentType: req.file.mimetype });
  const application = await Application.create({
    job: job._id,
    applicant: req.user._id,
    recruiter: job.recruiter,
    coverLetter: req.body.coverLetter,
    resume: { key, fileName: req.file.originalname, mimeType: req.file.mimetype, size: req.file.size },
    resumeText,
    statusHistory: [{ status: 'Applied', changedBy: req.user._id, note: 'Application submitted' }],
    analysis: { status: 'pending' }
  });
  runAnalysis(application._id);
  res.status(201).json({ application });
}));

applicationsRouter.get('/mine', requireAuth, requireRole('applicant'), asyncHandler(async (req, res) => {
  const items = await Application.find({ applicant: req.user._id })
    .populate('job', 'title company location status')
    .sort({ createdAt: -1 });
  res.json({ items });
}));

applicationsRouter.get('/stats/dashboard', requireAuth, requireRole('recruiter'), asyncHandler(async (req, res) => {
  const [activeJobs, pipeline, recent] = await Promise.all([
    Job.countDocuments({ recruiter: req.user._id, status: 'published' }),
    Application.aggregate([
      { $match: { recruiter: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Application.find({ recruiter: req.user._id }).populate('job', 'title').populate('applicant', 'name').sort({ updatedAt: -1 }).limit(6)
  ]);
  res.json({ activeJobs, pipeline, recent });
}));

applicationsRouter.get('/recruiter', requireAuth, requireRole('recruiter'), [
  query('job').optional({ values: 'falsy' }).isMongoId(),
  query('status').optional({ values: 'falsy' }).isIn(applicationStatuses),
  query('minScore').optional({ values: 'falsy' }).isInt({ min: 0, max: 100 })
], validate, asyncHandler(async (req, res) => {
  const filter = { recruiter: req.user._id };
  if (req.query.job) filter.job = req.query.job;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.minScore) filter['analysis.matchScore'] = { $gte: Number(req.query.minScore) };
  const items = await Application.find(filter)
    .populate('job', 'title company')
    .populate('applicant', 'name email applicantProfile')
    .sort({ 'analysis.matchScore': -1, createdAt: -1 });
  res.json({ items });
}));

applicationsRouter.get('/:id/resume', requireAuth, asyncHandler(async (req, res) => {
  const app = await Application.findById(req.params.id);
  if (!app) throw new AppError('Application not found', 404);
  const owns = req.user.role === 'recruiter'
    ? app.recruiter.equals(req.user._id)
    : app.applicant.equals(req.user._id);
  if (!owns) throw new AppError('Application not found', 404);
  return sendPrivateFile({ key: app.resume.key, fileName: app.resume.fileName, res });
}));

applicationsRouter.get('/:id', requireAuth, asyncHandler(async (req, res) => {
  const app = await Application.findById(req.params.id)
    .populate('job')
    .populate('applicant', 'name email applicantProfile')
    .populate('recruiter', 'name company');
  if (!app) throw new AppError('Application not found', 404);
  const owns = req.user.role === 'recruiter'
    ? app.recruiter._id.equals(req.user._id)
    : app.applicant._id.equals(req.user._id);
  if (!owns) throw new AppError('Application not found', 404);
  res.json({ application: app, resumeUrl: await signedResumeUrl(app.resume.key) });
}));

applicationsRouter.patch('/:id/status', requireAuth, requireRole('recruiter'), [
  body('status').isIn(applicationStatuses),
  body('note').optional().isString()
], validate, asyncHandler(async (req, res) => {
  const app = await Application.findOne({ _id: req.params.id, recruiter: req.user._id }).populate('job applicant');
  if (!app) throw new AppError('Application not found', 404);
  app.status = req.body.status;
  app.statusHistory.push({ status: req.body.status, changedBy: req.user._id, note: req.body.note });
  await app.save();
  const email = await sendStatusEmail({
    to: app.applicant.email,
    name: app.applicant.name,
    jobTitle: app.job.title,
    status: app.status
  }).catch((error) => ({ failed: true, error: error.message }));
  res.json({ application: app, email });
}));

applicationsRouter.post('/:id/retry-analysis', requireAuth, requireRole('recruiter'), asyncHandler(async (req, res) => {
  const app = await Application.findOne({ _id: req.params.id, recruiter: req.user._id });
  if (!app) throw new AppError('Application not found', 404);
  runAnalysis(app._id);
  res.json({ application: app, message: 'Analysis retry started' });
}));

applicationsRouter.post('/:id/interview', requireAuth, requireRole('recruiter'), [
  body('startsAt').isISO8601(),
  body('locationOrLink').trim().isLength({ min: 3 }),
  body('message').trim().isLength({ min: 5 })
], validate, asyncHandler(async (req, res) => {
  const app = await Application.findOne({ _id: req.params.id, recruiter: req.user._id }).populate('job applicant');
  if (!app) throw new AppError('Application not found', 404);
  app.interview = { ...req.body, sentAt: new Date() };
  if (app.status !== 'Interview') {
    app.status = 'Interview';
    app.statusHistory.push({ status: 'Interview', changedBy: req.user._id, note: 'Interview invitation sent' });
  }
  await app.save();
  const email = await sendInterviewEmail({
    to: app.applicant.email,
    name: app.applicant.name,
    jobTitle: app.job.title,
    ...req.body
  }).catch((error) => ({ failed: true, error: error.message }));
  res.json({ application: app, email });
}));

