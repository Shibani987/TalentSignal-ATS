import assert from 'node:assert/strict';
import test from 'node:test';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDb, disconnectDb } from '../src/config/db.js';

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
