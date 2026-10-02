import assert from 'node:assert/strict';
import test from 'node:test';
import {
  analyzeProfileResume,
  analyzeResume,
  parseJsonResponse,
  validateAnalysisResponse,
  validateResumeReadinessResponse
} from '../src/services/analysis.js';
import { env } from '../src/config/env.js';

test('validates a structured AI analysis response', () => {
  const result = validateAnalysisResponse({
    matchScore: 91,
    matchedSkills: ['React'],
    missingSkills: ['AWS'],
    relevantExperience: 'Built dashboards.',
    summary: 'Evidence-based summary.'
  });
  assert.equal(result.matchScore, 91);
});

test('fills optional analysis arrays with safe defaults', () => {
  const result = validateAnalysisResponse({
    matchScore: 72,
    summary: 'Candidate has enough evidence for a partial match.'
  });
  assert.deepEqual(result.matchedSkills, []);
  assert.deepEqual(result.missingSkills, []);
  assert.equal(result.relevantExperience, '');
});

test('rejects invalid analysis scores', () => {
  assert.throws(() => validateAnalysisResponse({ matchScore: 120, summary: 'Bad' }));
});

test('validates a structured resume readiness response', () => {
  const result = validateResumeReadinessResponse({
    score: 84,
    strengths: ['Clear skills section'],
    improvements: ['Add more measurable outcomes'],
    summary: 'Strong ATS-ready resume with a few keyword gaps.'
  });
  assert.equal(result.score, 84);
});

test('rejects fractional resume readiness scores', () => {
  assert.throws(() => validateResumeReadinessResponse({ score: 84.5, summary: 'Score must be an integer.' }));
});

test('wraps malformed model JSON with a clear error', () => {
  assert.throws(
    () => parseJsonResponse('{bad json', 'Gemini analysis response'),
    /Gemini analysis response was not valid JSON/
  );
});

test('labels demo resume analysis with the fallback provider', async () => {
  const previousProvider = env.aiProvider;
  try {
    env.aiProvider = 'demo';
    const result = await analyzeResume({
      resumeText: 'Built React and Node projects with 3 deployed dashboards.',
      job: { title: 'Frontend Developer', requiredSkills: ['React', 'Node'] }
    });
    assert.equal(result.provider, 'TalentSignal AI');
    assert.equal(typeof result.matchScore, 'number');
  } finally {
    env.aiProvider = previousProvider;
  }
});

test('falls back to demo resume readiness when Gemini models are unavailable', async () => {
  const previousProvider = env.aiProvider;
  const previousKey = env.geminiApiKey;
  const previousModel = env.geminiModel;
  const previousFetch = globalThis.fetch;
  try {
    env.aiProvider = 'gemini';
    env.geminiApiKey = 'test-key';
    env.geminiModel = 'gemini-missing-model';
    globalThis.fetch = async () => ({ ok: false, status: 404 });

    const result = await analyzeProfileResume({
      resumeText: 'Developed JavaScript APIs and React dashboards for 4 projects.',
      profile: { skills: ['JavaScript', 'React'] }
    });

    assert.equal(result.provider, 'TalentSignal AI');
    assert.equal(typeof result.score, 'number');
  } finally {
    env.aiProvider = previousProvider;
    env.geminiApiKey = previousKey;
    env.geminiModel = previousModel;
    globalThis.fetch = previousFetch;
  }
});
