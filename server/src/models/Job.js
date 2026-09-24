import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, index: 'text' },
  company: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  workMode: { type: String, enum: ['remote', 'hybrid', 'onsite'], default: 'hybrid', index: true },
  employmentType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship'], default: 'full-time', index: true },
  salaryMin: Number,
  salaryMax: Number,
  description: { type: String, required: true },
  responsibilities: [String],
  requiredSkills: { type: [String], index: true },
  experienceRequirements: { type: String, required: true },
  applicationDeadline: Date,
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true }
}, { timestamps: true });

jobSchema.index({ title: 'text', company: 'text', location: 'text', requiredSkills: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });

export const Job = mongoose.model('Job', jobSchema);
