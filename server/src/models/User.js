import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const educationSchema = new mongoose.Schema({
  school: String,
  degree: String,
  startYear: Number,
  endYear: Number
}, { _id: false });

const experienceSchema = new mongoose.Schema({
  title: String,
  company: String,
  years: Number,
  summary: String
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['recruiter', 'applicant'], required: true, index: true },
  company: {
    name: String,
    website: String,
    size: String,
    description: String
  },
  applicantProfile: {
    phone: String,
    location: String,
    skills: [String],
    experience: [experienceSchema],
    education: [educationSchema],
    resume: {
      key: String,
      fileName: String,
      mimeType: String,
      uploadedAt: Date,
      extractedText: String
    },
    resumeAnalysis: {
      status: { type: String, enum: ['pending', 'processing', 'succeeded', 'failed'], default: 'pending' },
      score: { type: Number, min: 0, max: 100 },
      strengths: [String],
      improvements: [String],
      summary: String,
      provider: String,
      error: String,
      analyzedAt: Date
    }
  }
}, { timestamps: true });

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.hashPassword = function hashPassword(password) {
  return bcrypt.hash(password, 12);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export const User = mongoose.model('User', userSchema);
