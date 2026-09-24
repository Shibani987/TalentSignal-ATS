import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { applicationsRouter } from './routes/applications.js';
import { authRouter } from './routes/auth.js';
import { filesRouter } from './routes/files.js';
import { jobsRouter } from './routes/jobs.js';
import { usersRouter } from './routes/users.js';
import { errorHandler, notFound } from './utils/errors.js';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.frontendOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.get('/api/health', (req, res) => res.json({ ok: true, demo: { ai: !env.openAiApiKey, storage: !env.s3Bucket, email: !env.smtpHost } }));
  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/jobs', jobsRouter);
  app.use('/api/applications', applicationsRouter);
  app.use('/api/files', filesRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
