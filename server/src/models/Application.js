import mongoose from 'mongoose';

export const applicationStatuses = ['Applied', 'Screening', 'Interview', 'Offered', 'Rejected'];

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, enum: applicationStatuses, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: String,
  changedAt: { type: Date, default: Date.now }
}, { _id: false });

const analysisSchema = new mongoose.Schema({
  status: { type: String, enum: ['pending', 'processing', 'succeeded', 'failed'], default: 'pending', index: true },
  matchScore: { type: Number, min: 0, max: 100 },
  matchedSkills: [String],
  missingSkills: [String],
  relevantExperience: String,
  summary: String,
  error: String,
  provider: String,
  analyzedAt: Date
}, { _id: false });

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  coverLetter: String,
  resume: {
    key: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: Number
  },
  resumeText: String,
  status: { type: String, enum: applicationStatuses, default: 'Applied', index: true },
  statusHistory: [statusHistorySchema],
  analysis: { type: analysisSchema, default: () => ({ status: 'pending' }) },
  interview: {
    startsAt: Date,
    locationOrLink: String,
    message: String,
    sentAt: Date
  }
}, { timestamps: true });

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ recruiter: 1, status: 1, createdAt: -1 });

export const Application = mongoose.model('Application', applicationSchema);
