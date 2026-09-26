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

export const resumeReadinessSchema = z.object({
  score: z.number().int().min(0).max(100),
  strengths: z.array(z.string()).default([]),
  improvements: z.array(z.string()).default([]),
  summary: z.string().min(1).max(900)
});

export function validateAnalysisResponse(value) {
  return analysisSchema.parse(value);
}

export function validateResumeReadinessResponse(value) {
  return resumeReadinessSchema.parse(value);
}

export function parseJsonResponse(content, label = 'AI response') {
  try {
    return JSON.parse(content);
  } catch {
    throw new Error(`${label} was not valid JSON`);
  }
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

export async function analyzeProfileResume({ resumeText, profile }) {
  const provider = activeAnalysisProvider();
  if (provider === 'openai') return analyzeProfileWithOpenAi({ resumeText, profile });
  if (provider === 'gemini') return analyzeProfileWithGemini({ resumeText, profile });
  return demoProfileAnalysis(resumeText, profile);
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

function buildProfilePrompt({ resumeText, profile }) {
  return [
    'Review this candidate resume for ATS readiness and recruiter clarity.',
    'Use only evidence present in the resume/profile. Do not invent qualifications.',
    'Return strict JSON only with these keys: score, strengths, improvements, summary.',
    'score must be an integer from 0 to 100.',
    'Focus improvements on practical resume changes: keywords, measurable impact, role clarity, missing sections, formatting, and experience evidence.',
    `Candidate skills: ${(profile?.skills || []).join(', ')}`,
    `Candidate location: ${profile?.location || ''}`,
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

  return validateAnalysisResponse(parseJsonResponse(completion.choices[0].message.content, 'OpenAI analysis response'));
}

async function analyzeWithGemini({ resumeText, job }) {
  const client = new GoogleGenerativeAI(env.geminiApiKey);
  const model = client.getGenerativeModel({
    model: env.geminiModel,
    generationConfig: { responseMimeType: 'application/json' }
  });
  const result = await model.generateContent(buildAnalysisPrompt({ resumeText, job }));
  return validateAnalysisResponse(parseJsonResponse(result.response.text(), 'Gemini analysis response'));
}

async function analyzeProfileWithOpenAi({ resumeText, profile }) {
  const client = new OpenAI({ apiKey: env.openAiApiKey });
  const completion = await client.chat.completions.create({
    model: env.openAiModel,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'You are a careful ATS resume reviewer returning validated JSON only.' },
      { role: 'user', content: buildProfilePrompt({ resumeText, profile }) }
    ]
  });
  return validateResumeReadinessResponse(parseJsonResponse(completion.choices[0].message.content, 'OpenAI resume readiness response'));
}

async function analyzeProfileWithGemini({ resumeText, profile }) {
  const client = new GoogleGenerativeAI(env.geminiApiKey);
  const model = client.getGenerativeModel({
    model: env.geminiModel,
    generationConfig: { responseMimeType: 'application/json' }
  });
  const result = await model.generateContent(buildProfilePrompt({ resumeText, profile }));
  return validateResumeReadinessResponse(parseJsonResponse(result.response.text(), 'Gemini resume readiness response'));
}

function demoProfileAnalysis(resumeText, profile) {
  const lower = resumeText.toLowerCase();
  const checks = [
    lower.includes('experience'),
    lower.includes('project') || lower.includes('built') || lower.includes('led'),
    /\d/.test(resumeText),
    (profile?.skills || []).some((skill) => lower.includes(skill.toLowerCase())),
    lower.includes('education') || lower.includes('degree') || lower.includes('university')
  ];
  const score = 45 + checks.filter(Boolean).length * 10;
  const improvements = [];
  if (!/\d/.test(resumeText)) improvements.push('Add measurable impact, such as percentages, revenue, latency, users, or time saved.');
  if (!lower.includes('project') && !lower.includes('built') && !lower.includes('led')) improvements.push('Describe concrete projects and responsibilities instead of only listing tools.');
  if (!(profile?.skills || []).some((skill) => lower.includes(skill.toLowerCase()))) improvements.push('Mirror important profile skills in the resume text so ATS parsers can detect them.');
  if (!lower.includes('education') && !lower.includes('degree') && !lower.includes('university')) improvements.push('Include education or certification details if relevant.');
  if (resumeText.length < 700) improvements.push('Expand the resume with role context, achievements, and relevant keywords.');
  return validateResumeReadinessResponse({
    score: Math.max(0, Math.min(100, score)),
    strengths: [
      resumeText.length >= 700 ? 'Resume has enough text for basic ATS parsing.' : 'Resume text was extracted successfully.',
      checks[3] ? 'Some profile skills appear in the resume.' : 'Profile skills are available for comparison.'
    ],
    improvements: improvements.length ? improvements : ['Resume is in good shape. Tailor keywords and impact bullets for each job before applying.'],
    summary: 'Demo ATS readiness review completed. Use these suggestions to improve clarity and keyword coverage before applying.'
  });
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
