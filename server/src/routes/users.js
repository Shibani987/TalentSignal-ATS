import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { resumeUpload } from '../middleware/upload.js';
import { User } from '../models/User.js';
import { activeAnalysisProvider, analyzeProfileResume } from '../services/analysis.js';
import { extractResumeText } from '../services/resume.js';
import { uploadPrivateFile } from '../services/storage.js';
import { AppError, asyncHandler } from '../utils/errors.js';

export const usersRouter = Router();

usersRouter.get('/me', requireAuth, asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeJSON ? req.user.toSafeJSON() : req.user });
}));

usersRouter.put('/me', requireAuth, asyncHandler(async (req, res) => {
  const allowed = req.user.role === 'recruiter'
    ? ['name', 'email', 'company']
    : ['name', 'email', 'applicantProfile'];
  if (req.body.email && req.body.email.toLowerCase() !== req.user.email) {
    const existing = await User.findOne({ email: req.body.email.toLowerCase(), _id: { $ne: req.user._id } });
    if (existing) throw new AppError('An account with this email already exists', 409);
    req.user.email = req.body.email.toLowerCase();
  }
  for (const key of allowed) {
    if (key !== 'email' && req.body[key] !== undefined) req.user[key] = req.body[key];
  }
  await req.user.save();
  res.json({ user: req.user.toSafeJSON() });
}));

usersRouter.put('/me/resume', requireAuth, requireRole('applicant'), resumeUpload.single('resume'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: { message: 'Resume file is required' } });
  }
  const resumeText = await extractResumeText(req.file);
  const key = `profile-resumes/${req.user._id}/${randomUUID()}-${req.file.originalname}`;
  await uploadPrivateFile({ key, buffer: req.file.buffer, contentType: req.file.mimetype });
  req.user.applicantProfile = {
    ...(req.user.applicantProfile || {}),
    resume: {
      key,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      uploadedAt: new Date(),
      extractedText: resumeText
    },
    resumeAnalysis: { status: 'processing' }
  };
  try {
    const result = await analyzeProfileResume({ resumeText, profile: req.user.applicantProfile });
    req.user.applicantProfile.resumeAnalysis = {
      ...result,
      status: 'succeeded',
      provider: activeAnalysisProvider(),
      analyzedAt: new Date()
    };
  } catch (error) {
    req.user.applicantProfile.resumeAnalysis = {
      status: 'failed',
      provider: activeAnalysisProvider(),
      error: error.message,
      analyzedAt: new Date()
    };
  }
  await req.user.save();
  res.json({ user: req.user.toSafeJSON() });
}));
