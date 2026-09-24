import assert from 'node:assert/strict';
import test from 'node:test';
import { validateAnalysisResponse } from '../src/services/analysis.js';

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
