import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { resumeUpload } from '../middleware/upload.js';
import { requireRole } from '../middleware/auth.js';
import { extractResumeText } from '../services/resume.js';
import { uploadPrivateFile } from '../services/storage.js';
import { randomUUID } from 'node:crypto';
import { asyncHandler } from '../utils/errors.js';

export const usersRouter = Router();

usersRouter.get('/me', requireAuth, asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeJSON ? req.user.toSafeJSON() : req.user });
}));

usersRouter.put('/me', requireAuth, asyncHandler(async (req, res) => {
  const allowed = req.user.role === 'recruiter'
    ? ['name', 'company']
    : ['name', 'applicantProfile'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) req.user[key] = req.body[key];
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
    }
  };
  await req.user.save();
  res.json({ user: req.user.toSafeJSON() });
}));
