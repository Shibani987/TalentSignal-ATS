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
  return 'TalentSignal AI';
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

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function findKeywordMatches(text, keywords) {
  const lower = text.toLowerCase();
  return unique(keywords.filter((keyword) => lower.includes(keyword.toLowerCase())));
}

function demoProfileAnalysis(resumeText, profile) {
  const lower = resumeText.toLowerCase();
  const commonKeywords = [
    'react', 'javascript', 'node', 'express', 'mongodb', 'sql', 'python', 'java', 'html', 'css',
    'api', 'git', 'github', 'figma', 'aws', 'docker', 'analytics', 'dashboard', 'leadership',
    'project', 'internship', 'frontend', 'backend', 'full stack', 'machine learning'
  ];
  const profileMatches = findKeywordMatches(resumeText, profile?.skills || []);
  const technicalMatches = findKeywordMatches(resumeText, commonKeywords);
  const hasContact = /@|linkedin|github|phone|email/i.test(resumeText);
  const hasNumbers = /\d/.test(resumeText);
  const hasProjectEvidence = lower.includes('project') || lower.includes('built') || lower.includes('developed') || lower.includes('created') || lower.includes('implemented');
  const hasRoleClarity = lower.includes('intern') || lower.includes('developer') || lower.includes('engineer') || lower.includes('analyst') || lower.includes('designer');
  const hasEducation = lower.includes('education') || lower.includes('degree') || lower.includes('university') || lower.includes('college') || lower.includes('b.tech') || lower.includes('bca') || lower.includes('mca');
  const checks = [
    lower.includes('experience') || hasRoleClarity,
    hasProjectEvidence,
    hasNumbers,
    profileMatches.length > 0 || technicalMatches.length >= 3,
    hasEducation,
    hasContact
  ];
  const score = 42 + checks.filter(Boolean).length * 9 + Math.min(12, technicalMatches.length * 2);
  const strengths = [];
  const improvements = [];

  if (resumeText.length >= 700) strengths.push('Resume has enough extracted content for ATS parsing and recruiter review.');
  else strengths.push('Resume text was extracted successfully, but the profile would benefit from more detail.');
  if (technicalMatches.length) strengths.push(`Detected relevant keywords: ${technicalMatches.slice(0, 8).join(', ')}.`);
  if (profileMatches.length) strengths.push(`Profile skills are reflected in the resume: ${profileMatches.slice(0, 6).join(', ')}.`);
  if (hasProjectEvidence) strengths.push('Project or hands-on delivery language is present, which helps recruiters understand practical ability.');
  if (hasContact) strengths.push('Contact/profile signals appear to be present, making the resume easier to validate.');

  if (!hasNumbers) improvements.push('Add measurable impact to 2-3 bullets, such as users served, percentage improvement, project count, performance gains, or timeline.');
  if (!hasProjectEvidence) improvements.push('Add concrete project bullets explaining what you built, which tools you used, and the result.');
  if (!profileMatches.length && (profile?.skills || []).length) improvements.push('Mirror your strongest profile skills directly in the resume so ATS keyword matching can detect them.');
  if (!hasEducation) improvements.push('Add education, degree, college/university, or certification details if they are relevant.');
  if (!hasRoleClarity) improvements.push('Make the target role clearer in the headline or summary, for example Frontend Developer, Full Stack Developer, or Data Analyst.');
  if (resumeText.length < 700) improvements.push('Expand the resume with role context, achievements, project descriptions, and relevant keywords.');

  return validateResumeReadinessResponse({
    score: Math.max(0, Math.min(100, score)),
    strengths: strengths.slice(0, 5),
    improvements: improvements.length ? improvements : [
      'Resume is strong overall. Tailor the top skills and 2-3 achievement bullets for each job before applying.',
      'Add role-specific keywords from the job description near the summary, skills, and project sections.'
    ],
    summary: `TalentSignal analyzed the resume for ATS readability, keyword coverage, project evidence, measurable impact, and recruiter clarity. ${technicalMatches.length ? `Strong keyword coverage was found around ${technicalMatches.slice(0, 5).join(', ')}.` : 'Add more role-specific technical keywords to improve matching.'}`
  });
}

function demoAnalysis(resumeText, job) {
  const lower = resumeText.toLowerCase();
  const required = job.requiredSkills || [];
  const matchedSkills = required.filter((skill) => lower.includes(skill.toLowerCase()));
  const missingSkills = required.filter((skill) => !matchedSkills.includes(skill));
  const hasExperience = lower.includes('year') || lower.includes('experience') || lower.includes('intern') || lower.includes('project');
  const hasImpact = /\d/.test(resumeText);
  const score = required.length
    ? Math.round((matchedSkills.length / required.length) * 72 + (hasExperience ? 14 : 6) + (hasImpact ? 8 : 0))
    : 68 + (hasExperience ? 8 : 0) + (hasImpact ? 6 : 0);
  return validateAnalysisResponse({
    matchScore: Math.max(0, Math.min(100, score)),
    matchedSkills,
    missingSkills,
    relevantExperience: hasExperience
      ? 'The resume includes experience or project evidence relevant to this role. Review project depth, ownership, and recency during screening.'
      : 'The resume has limited explicit experience evidence for this role. Ask for project examples or portfolio links during review.',
    summary: `TalentSignal matched ${matchedSkills.length} of ${required.length} required skills for ${job.title}. ${missingSkills.length ? `Missing or weak keywords: ${missingSkills.slice(0, 5).join(', ')}.` : 'Required keywords are well covered.'} ${hasImpact ? 'The resume includes measurable details, which improves recruiter confidence.' : 'Adding measurable outcomes would strengthen the application.'}`
  });
}
