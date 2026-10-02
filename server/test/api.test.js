import assert from 'node:assert/strict';
import test from 'node:test';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDb, disconnectDb } from '../src/config/db.js';
import { env } from '../src/config/env.js';
import { signToken } from '../src/middleware/auth.js';
import { Application } from '../src/models/Application.js';
import { Job } from '../src/models/Job.js';
import { User } from '../src/models/User.js';

let mongod;
let app;

test.before(async () => {
  mongod = await MongoMemoryServer.create();
  await connectDb(mongod.getUri());
  app = createApp();
});

test.after(async () => {
  await disconnectDb();
  await mongod.stop();
});

test.afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

test('reports API health and demo flags', async () => {
  const res = await request(app).get('/api/health').expect(200);
  assert.equal(res.body.ok, true);
  assert.equal(typeof res.body.demo.ai, 'boolean');
  assert.equal(typeof res.body.demo.storage, 'boolean');
  assert.equal(typeof res.body.demo.email, 'boolean');
});

async function register(role, email) {
  const res = await request(app).post('/api/auth/register').send({ name: `${role} User`, email, password: 'Password123!', role, companyName: 'Demo Co' });
  assert.equal(res.status, 201);
  return res.body;
}

test('prevents applicants from creating jobs', async () => {
  const applicant = await register('applicant', 'applicant@test.com');
  const res = await request(app)
    .post('/api/jobs')
    .set('Authorization', `Bearer ${applicant.token}`)
    .send({ title: 'Role', company: 'Co', location: 'Remote', description: 'Long enough job description', experienceRequirements: '2 years' });
  assert.equal(res.status, 403);
});

test('returns the current user for a valid token', async () => {
  const applicant = await register('applicant', 'me@test.com');
  const res = await request(app)
    .get('/api/users/me')
    .set('Authorization', `Bearer ${applicant.token}`)
    .expect(200);
  assert.equal(res.body.user.email, 'me@test.com');
  assert.equal(res.body.user.role, 'applicant');
  assert.equal(res.body.user.passwordHash, undefined);
});

test('rejects duplicate account registration', async () => {
  await register('applicant', 'duplicate@test.com');
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Second User', email: 'duplicate@test.com', password: 'Password123!', role: 'applicant' })
    .expect(409);
  assert.equal(res.body.error.message, 'An account with this email already exists');
});

test('rejects invalid registration payloads', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'A', email: 'not-an-email', password: 'short', role: 'manager' })
    .expect(400);
  assert.equal(res.body.error.message, 'Validation failed');
  assert.ok(res.body.error.details.length >= 4);
});

test('rejects malformed bearer tokens', async () => {
  const res = await request(app)
    .get('/api/users/me')
    .set('Authorization', 'Bearer not-a-real-token')
    .expect(401);
  assert.equal(res.body.error.message, 'Invalid or expired token');
});

test('allows recruiter job creation and public listing', async () => {
  const recruiter = await register('recruiter', 'recruiter@test.com');
  const created = await request(app)
    .post('/api/jobs')
    .set('Authorization', `Bearer ${recruiter.token}`)
    .send({
      title: 'Backend Engineer',
      company: 'Demo Co',
      location: 'Remote',
      description: 'Build reliable APIs for recruiting workflows.',
      experienceRequirements: '3 years',
      requiredSkills: ['Node.js']
    });
  assert.equal(created.status, 201);
  await request(app).patch(`/api/jobs/${created.body.job._id}/status`).set('Authorization', `Bearer ${recruiter.token}`).send({ status: 'published' }).expect(200);
  const listed = await request(app).get('/api/jobs/public');
  assert.equal(listed.body.total, 1);
});

test('filters public jobs by work mode and employment type', async () => {
  const recruiter = await register('recruiter', 'filters@test.com');
  const jobs = [
    {
      title: 'Remote Backend Engineer',
      company: 'Demo Co',
      location: 'Remote',
      workMode: 'remote',
      employmentType: 'full-time',
      description: 'Build reliable APIs for recruiting workflows.',
      experienceRequirements: '3 years',
      requiredSkills: ['Node.js']
    },
    {
      title: 'Onsite Design Intern',
      company: 'Demo Co',
      location: 'Kolkata',
      workMode: 'onsite',
      employmentType: 'internship',
      description: 'Support hiring product design and research workflows.',
      experienceRequirements: '0-1 years',
      requiredSkills: ['Figma']
    }
  ];

  for (const job of jobs) {
    const created = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiter.token}`)
      .send(job)
      .expect(201);
    await request(app)
      .patch(`/api/jobs/${created.body.job._id}/status`)
      .set('Authorization', `Bearer ${recruiter.token}`)
      .send({ status: 'published' })
      .expect(200);
  }

  const listed = await request(app).get('/api/jobs/public?workMode=remote&employmentType=full-time').expect(200);
  assert.equal(listed.body.total, 1);
  assert.equal(listed.body.items[0].title, 'Remote Backend Engineer');
});

test('accepts browser datetime values for interview invitations', async () => {
  const previousSmtp = {
    host: env.smtpHost,
    user: env.smtpUser,
    pass: env.smtpPass
  };
  env.smtpHost = undefined;
  env.smtpUser = undefined;
  env.smtpPass = undefined;
  const [recruiter, applicant] = await Promise.all([
    User.create({
      name: 'Recruiter User',
      email: 'interviewer@test.com',
      role: 'recruiter',
      passwordHash: await User.hashPassword('Password123!')
    }),
    User.create({
      name: 'Applicant User',
      email: 'candidate@test.com',
      role: 'applicant',
      passwordHash: await User.hashPassword('Password123!')
    })
  ]);
  const job = await Job.create({
    recruiter: recruiter._id,
    title: 'Frontend Developer',
    company: 'Demo Co',
    location: 'Remote',
    description: 'Build polished candidate workflows.',
    experienceRequirements: '1 year',
    status: 'published'
  });
  const application = await Application.create({
    job: job._id,
    applicant: applicant._id,
    recruiter: recruiter._id,
    resume: {
      key: 'resumes/demo.pdf',
      fileName: 'demo.pdf',
      mimeType: 'application/pdf',
      size: 1024
    },
    resumeText: 'React developer with interview-ready project experience.',
    statusHistory: [{ status: 'Applied', changedBy: applicant._id, note: 'Application submitted' }]
  });

  try {
    const res = await request(app)
      .post(`/api/applications/${application._id}/interview`)
      .set('Authorization', `Bearer ${signToken(recruiter)}`)
      .send({
        startsAt: '2026-10-05T14:30',
        locationOrLink: 'Google Meet',
        message: 'We would like to discuss your resume and projects.'
      })
      .expect(200);

    assert.equal(res.body.application.status, 'Interview');
    assert.equal(res.body.application.interview.locationOrLink, 'Google Meet');
  } finally {
    env.smtpHost = previousSmtp.host;
    env.smtpUser = previousSmtp.user;
    env.smtpPass = previousSmtp.pass;
  }
});
