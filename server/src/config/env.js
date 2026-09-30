import dotenv from 'dotenv';

dotenv.config();

const clean = (value) => value?.trim();

export const env = {
  port: clean(process.env.PORT) || 5000,
  nodeEnv: clean(process.env.NODE_ENV) || 'development',
  mongoUri: clean(process.env.MONGODB_URI) || 'mongodb://127.0.0.1:27017/ai_ats',
  jwtSecret: clean(process.env.JWT_SECRET) || 'development-only-change-me',
  frontendOrigin: clean(process.env.FRONTEND_ORIGIN) || 'http://localhost:5173',
  awsRegion: clean(process.env.AWS_REGION),
  awsAccessKeyId: clean(process.env.AWS_ACCESS_KEY_ID),
  awsSecretAccessKey: clean(process.env.AWS_SECRET_ACCESS_KEY),
  s3Bucket: clean(process.env.S3_BUCKET),
  cloudinaryCloudName: clean(process.env.CLOUDINARY_CLOUD_NAME),
  cloudinaryApiKey: clean(process.env.CLOUDINARY_API_KEY),
  cloudinaryApiSecret: clean(process.env.CLOUDINARY_API_SECRET),
  storageProvider: clean(process.env.STORAGE_PROVIDER) || 'auto',
  aiProvider: clean(process.env.AI_PROVIDER) || 'demo',
  openAiApiKey: clean(process.env.OPENAI_API_KEY),
  openAiModel: clean(process.env.OPENAI_MODEL) || 'gpt-4o-mini',
  geminiApiKey: clean(process.env.GEMINI_API_KEY),
  geminiModel: clean(process.env.GEMINI_MODEL) || 'gemini-1.5-flash',
  smtpHost: clean(process.env.SMTP_HOST),
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: clean(process.env.SMTP_USER),
  smtpPass: clean(process.env.SMTP_PASS),
  smtpFrom: clean(process.env.SMTP_FROM) || 'ATS Demo <no-reply@example.com>'
};

export const isProduction = env.nodeEnv === 'production';
