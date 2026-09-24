import { connectDb, disconnectDb } from './config/db.js';
import { Application } from './models/Application.js';
import { Job } from './models/Job.js';
import { User } from './models/User.js';

await connectDb();

const demoEmails = ['recruiter@example.com', 'applicant@example.com', 'maya@example.com', 'neha@example.com', 'kabir@example.com'];
const existingDemoUsers = await User.find({ email: { $in: demoEmails } }).select('_id');
const existingDemoIds = existingDemoUsers.map((user) => user._id);
const existingDemoJobs = await Job.find({
  $or: [
    { recruiter: { $in: existingDemoIds } },
    { company: 'Northstar Labs' }
  ]
}).select('_id');
const existingDemoJobIds = existingDemoJobs.map((job) => job._id);

await Promise.all([
  Application.deleteMany({
    $or: [
      { recruiter: { $in: existingDemoIds } },
      { applicant: { $in: existingDemoIds } },
      { job: { $in: existingDemoJobIds } }
    ]
  }),
  Job.deleteMany({
    $or: [
      { recruiter: { $in: existingDemoIds } },
      { company: 'Northstar Labs' }
    ]
  }),
  User.deleteMany({ email: { $in: demoEmails } })
]);

const passwordHash = await User.hashPassword('Password123!');
const recruiter = await User.create({
  name: 'Priya Shah',
  email: 'recruiter@example.com',
  passwordHash,
  role: 'recruiter',
  company: { name: 'Northstar Labs', website: 'https://example.com', size: '51-200', description: 'B2B product studio' }
});
const applicant = await User.create({
  name: 'Aarav Mehta',
  email: 'applicant@example.com',
  passwordHash,
  role: 'applicant',
  applicantProfile: {
    location: 'Bengaluru',
    skills: ['React', 'Node.js', 'MongoDB'],
    experience: [{ title: 'Frontend Engineer', company: 'Acme', years: 3, summary: 'Built customer dashboards.' }],
    education: [{ school: 'VTU', degree: 'B.Tech', startYear: 2017, endYear: 2021 }]
  }
});
const applicants = await User.insertMany([
  {
    name: 'Maya Iyer',
    email: 'maya@example.com',
    passwordHash,
    role: 'applicant',
    applicantProfile: {
      location: 'Pune',
      skills: ['Product Analytics', 'SQL', 'Tableau', 'Experimentation'],
      experience: [{ title: 'Product Analyst', company: 'Finovo', years: 4, summary: 'Owned funnel analysis and A/B testing.' }],
      education: [{ school: 'Delhi University', degree: 'B.Sc Statistics', startYear: 2015, endYear: 2018 }]
    }
  },
  {
    name: 'Neha Banerjee',
    email: 'neha@example.com',
    passwordHash,
    role: 'applicant',
    applicantProfile: {
      location: 'Kolkata',
      skills: ['UX Research', 'Figma', 'Design Systems', 'Usability Testing'],
      experience: [{ title: 'Product Designer', company: 'StudioGrid', years: 5, summary: 'Designed B2B workflow products.' }],
      education: [{ school: 'NID', degree: 'M.Des', startYear: 2016, endYear: 2018 }]
    }
  },
  {
    name: 'Kabir Rao',
    email: 'kabir@example.com',
    passwordHash,
    role: 'applicant',
    applicantProfile: {
      location: 'Hyderabad',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Node.js'],
      experience: [{ title: 'DevOps Engineer', company: 'Cloudlane', years: 6, summary: 'Managed production Kubernetes and CI/CD platforms.' }],
      education: [{ school: 'JNTU', degree: 'B.Tech CSE', startYear: 2013, endYear: 2017 }]
    }
  }
]);

const jobs = await Job.insertMany([
  {
    recruiter: recruiter._id,
    title: 'Full Stack Engineer',
    company: 'Northstar Labs',
    location: 'Bengaluru',
    workMode: 'hybrid',
    employmentType: 'full-time',
    salaryMin: 1800000,
    salaryMax: 2800000,
    description: 'Build and maintain modern product workflows across React, Node.js, and MongoDB services.',
    responsibilities: ['Own product features end to end', 'Collaborate with design and product', 'Improve API reliability'],
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'REST APIs'],
    experienceRequirements: '3+ years building production web applications',
    applicationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    status: 'published'
  },
  {
    recruiter: recruiter._id,
    title: 'Product Analyst',
    company: 'Northstar Labs',
    location: 'Remote',
    workMode: 'remote',
    employmentType: 'full-time',
    salaryMin: 1400000,
    salaryMax: 2200000,
    description: 'Partner with product and growth teams to measure user journeys, define metrics, and improve conversion.',
    responsibilities: ['Build product dashboards', 'Run funnel and cohort analysis', 'Design experiment measurement plans'],
    requiredSkills: ['SQL', 'Tableau', 'Experimentation', 'Product Analytics'],
    experienceRequirements: '3+ years in product analytics or growth analytics',
    applicationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21),
    status: 'published'
  },
  {
    recruiter: recruiter._id,
    title: 'Senior Product Designer',
    company: 'Northstar Labs',
    location: 'Mumbai',
    workMode: 'hybrid',
    employmentType: 'full-time',
    salaryMin: 2000000,
    salaryMax: 3400000,
    description: 'Design refined SaaS workflows for recruiters, applicants, and hiring teams across web and mobile surfaces.',
    responsibilities: ['Lead discovery with customers', 'Prototype complex workflows', 'Maintain design system quality'],
    requiredSkills: ['Figma', 'Design Systems', 'UX Research', 'Usability Testing'],
    experienceRequirements: '5+ years designing B2B SaaS or workflow products',
    applicationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
    status: 'published'
  },
  {
    recruiter: recruiter._id,
    title: 'Platform Engineer',
    company: 'Northstar Labs',
    location: 'Hyderabad',
    workMode: 'onsite',
    employmentType: 'full-time',
    salaryMin: 2400000,
    salaryMax: 3800000,
    description: 'Improve deployment reliability, observability, and infrastructure automation for high-traffic Node.js services.',
    responsibilities: ['Own CI/CD pipelines', 'Manage Kubernetes workloads', 'Improve cloud cost and reliability'],
    requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
    experienceRequirements: '5+ years in platform, DevOps, or infrastructure engineering',
    applicationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 35),
    status: 'published'
  },
  {
    recruiter: recruiter._id,
    title: 'Talent Operations Intern',
    company: 'Northstar Labs',
    location: 'Bengaluru',
    workMode: 'hybrid',
    employmentType: 'internship',
    description: 'Support recruiting operations, interview coordination, job posting hygiene, and candidate communication.',
    responsibilities: ['Coordinate interview schedules', 'Maintain ATS data quality', 'Prepare weekly recruiting reports'],
    requiredSkills: ['Communication', 'Spreadsheets', 'Coordination'],
    experienceRequirements: 'Strong communication skills and interest in people operations',
    applicationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18),
    status: 'draft'
  }
]);

await Application.insertMany([
{
  job: jobs[0]._id,
  applicant: applicant._id,
  recruiter: recruiter._id,
  coverLetter: 'I have shipped React and Node.js products for three years.',
  resume: { key: 'demo/resume.txt', fileName: 'aarav-resume.txt', mimeType: 'text/plain', size: 256 },
  resumeText: 'React Node.js MongoDB engineer with 3 years experience building REST APIs and dashboards.',
  status: 'Screening',
  statusHistory: [{ status: 'Applied', changedBy: applicant._id }, { status: 'Screening', changedBy: recruiter._id }],
  analysis: {
    status: 'succeeded',
    matchScore: 82,
    matchedSkills: ['React', 'Node.js', 'MongoDB', 'REST APIs'],
    missingSkills: [],
    relevantExperience: '3 years building web applications and APIs.',
    summary: 'Strong match based on required stack coverage and stated production experience.',
    provider: 'demo',
    analyzedAt: new Date()
  }
},
{
  job: jobs[1]._id,
  applicant: applicants[0]._id,
  recruiter: recruiter._id,
  coverLetter: 'I have led product analytics for conversion and retention workflows.',
  resume: { key: 'demo/maya-resume.txt', fileName: 'maya-resume.txt', mimeType: 'text/plain', size: 284 },
  resumeText: 'Product analyst with 4 years experience using SQL, Tableau, experimentation, funnel analysis, cohort analysis, and product analytics.',
  status: 'Interview',
  statusHistory: [
    { status: 'Applied', changedBy: applicants[0]._id },
    { status: 'Screening', changedBy: recruiter._id },
    { status: 'Interview', changedBy: recruiter._id, note: 'Strong analytics background' }
  ],
  analysis: {
    status: 'succeeded',
    matchScore: 91,
    matchedSkills: ['SQL', 'Tableau', 'Experimentation', 'Product Analytics'],
    missingSkills: [],
    relevantExperience: '4 years in product analytics with experimentation and funnel analysis.',
    summary: 'Excellent match for the analytics role based on required tool coverage and relevant product measurement experience.',
    provider: 'demo',
    analyzedAt: new Date()
  },
  interview: {
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    locationOrLink: 'Google Meet link pending',
    message: 'We would like to discuss your product analytics work.',
    sentAt: new Date()
  }
},
{
  job: jobs[2]._id,
  applicant: applicants[1]._id,
  recruiter: recruiter._id,
  coverLetter: 'I design practical B2B workflows with strong research foundations.',
  resume: { key: 'demo/neha-resume.txt', fileName: 'neha-resume.txt', mimeType: 'text/plain', size: 310 },
  resumeText: 'Senior product designer with 5 years experience in Figma, design systems, UX research, usability testing, and B2B SaaS workflows.',
  status: 'Offered',
  statusHistory: [
    { status: 'Applied', changedBy: applicants[1]._id },
    { status: 'Screening', changedBy: recruiter._id },
    { status: 'Interview', changedBy: recruiter._id },
    { status: 'Offered', changedBy: recruiter._id, note: 'Portfolio and interview feedback were strong' }
  ],
  analysis: {
    status: 'succeeded',
    matchScore: 94,
    matchedSkills: ['Figma', 'Design Systems', 'UX Research', 'Usability Testing'],
    missingSkills: [],
    relevantExperience: '5 years designing B2B workflow products with research and design systems.',
    summary: 'Very strong fit for the senior design role with clear evidence across every required skill.',
    provider: 'demo',
    analyzedAt: new Date()
  }
},
{
  job: jobs[3]._id,
  applicant: applicants[2]._id,
  recruiter: recruiter._id,
  coverLetter: 'I can help improve platform reliability and delivery automation.',
  resume: { key: 'demo/kabir-resume.txt', fileName: 'kabir-resume.txt', mimeType: 'text/plain', size: 330 },
  resumeText: 'Platform engineer with 6 years experience in AWS, Docker, Kubernetes, Terraform, CI/CD, observability, and Node.js service deployments.',
  status: 'Screening',
  statusHistory: [
    { status: 'Applied', changedBy: applicants[2]._id },
    { status: 'Screening', changedBy: recruiter._id, note: 'Relevant infrastructure background' }
  ],
  analysis: {
    status: 'succeeded',
    matchScore: 88,
    matchedSkills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
    missingSkills: [],
    relevantExperience: '6 years managing cloud infrastructure, Kubernetes workloads, and deployment automation.',
    summary: 'Strong platform engineering match with direct evidence for all required infrastructure skills.',
    provider: 'demo',
    analyzedAt: new Date()
  }
},
{
  job: jobs[0]._id,
  applicant: applicants[2]._id,
  recruiter: recruiter._id,
  coverLetter: 'I have backend and platform experience, but less frontend depth.',
  resume: { key: 'demo/kabir-fullstack-resume.txt', fileName: 'kabir-fullstack-resume.txt', mimeType: 'text/plain', size: 302 },
  resumeText: 'Node.js platform engineer with REST APIs, Docker, Kubernetes, AWS, Terraform, and MongoDB experience. Limited React production work.',
  status: 'Rejected',
  statusHistory: [
    { status: 'Applied', changedBy: applicants[2]._id },
    { status: 'Screening', changedBy: recruiter._id },
    { status: 'Rejected', changedBy: recruiter._id, note: 'Better aligned to platform role than full stack role' }
  ],
  analysis: {
    status: 'succeeded',
    matchScore: 63,
    matchedSkills: ['Node.js', 'MongoDB', 'REST APIs'],
    missingSkills: ['React'],
    relevantExperience: 'Relevant backend and API experience; limited explicit frontend evidence.',
    summary: 'Partial match for the full stack role. Backend skills are present, but React evidence is limited.',
    provider: 'demo',
    analyzedAt: new Date()
  }
}
]);

console.log('Seeded demo accounts: recruiter@example.com / Password123!, applicant@example.com / Password123!');
console.log('Added 5 jobs, 4 applicants, and 5 applications with pipeline/status data.');
await disconnectDb();
