import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parseJsonResponse,
  validateAnalysisResponse,
  validateResumeReadinessResponse
} from '../src/services/analysis.js';

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

test('wraps malformed model JSON with a clear error', () => {
  assert.throws(
    () => parseJsonResponse('{bad json', 'Gemini analysis response'),
    /Gemini analysis response was not valid JSON/
  );
});
