import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { z } from 'zod';
import { env } from '../config/env.js';

export const analysisSchema = z.object({
  matchScore: z.number().int().min(0).max(100),
  matchedSkills: z.array(z.string()).default([]),
  missingSkills: z.array(z.string()).default([]),
  relevantExperience: z.string().default(''),
  summary: z.string().min(1).max(900)
});

export function validateAnalysisResponse(value) {
  return analysisSchema.parse(value);
}

export function activeAnalysisProvider() {
  if (env.aiProvider === 'openai' && env.openAiApiKey) return 'openai';
  if (env.aiProvider === 'gemini' && env.geminiApiKey) return 'gemini';
  return 'demo';
}

export async function analyzeResume({ resumeText, job }) {
  const provider = activeAnalysisProvider();
  if (provider === 'openai') {
    return analyzeWithOpenAi({ resumeText, job });
  }

  if (provider === 'gemini') {
    return analyzeWithGemini({ resumeText, job });
  }

  return demoAnalysis(resumeText, job);
}

function buildAnalysisPrompt({ resumeText, job }) {
  return [
    'Analyze this resume against the job requirements. Use only evidence present in the resume.',
    'Do not infer personal traits, protected characteristics, or qualifications not present.',
    'Return strict JSON only with these keys: matchScore, matchedSkills, missingSkills, relevantExperience, summary.',
    'matchScore must be an integer from 0 to 100.',
    `Job title: ${job.title}`,
    `Required skills: ${(job.requiredSkills || []).join(', ')}`,
    `Experience requirements: ${job.experienceRequirements}`,
    `Responsibilities: ${(job.responsibilities || []).join('; ')}`,
    `Resume text: ${resumeText}`
  ].join('\n');
}

async function analyzeWithOpenAi({ resumeText, job }) {
  const client = new OpenAI({ apiKey: env.openAiApiKey });
  const prompt = {
    role: 'user',
    content: buildAnalysisPrompt({ resumeText, job })
  };

  const completion = await client.chat.completions.create({
    model: env.openAiModel,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'You are a careful recruiting assistant returning validated JSON only.' },
      prompt
    ]
  });

  return validateAnalysisResponse(JSON.parse(completion.choices[0].message.content));
}

async function analyzeWithGemini({ resumeText, job }) {
  const client = new GoogleGenerativeAI(env.geminiApiKey);
  const model = client.getGenerativeModel({
    model: env.geminiModel,
    generationConfig: { responseMimeType: 'application/json' }
  });
  const result = await model.generateContent(buildAnalysisPrompt({ resumeText, job }));
  return validateAnalysisResponse(JSON.parse(result.response.text()));
}

function demoAnalysis(resumeText, job) {
  const lower = resumeText.toLowerCase();
  const required = job.requiredSkills || [];
  const matchedSkills = required.filter((skill) => lower.includes(skill.toLowerCase()));
  const missingSkills = required.filter((skill) => !matchedSkills.includes(skill));
  const score = required.length ? Math.round((matchedSkills.length / required.length) * 78 + 12) : 65;
  return validateAnalysisResponse({
    matchScore: Math.max(0, Math.min(100, score)),
    matchedSkills,
    missingSkills,
    relevantExperience: lower.includes('year') || lower.includes('experience')
      ? 'The resume includes experience references, but demo mode cannot verify seniority beyond extracted text.'
      : 'No explicit experience duration was found in the extracted resume text.',
    summary: `Demo analysis found ${matchedSkills.length} of ${required.length} required skills in the resume text. Review the resume directly before making a hiring decision.`
  });
}
