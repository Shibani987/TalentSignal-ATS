import multer from 'multer';
import { AppError } from '../utils/errors.js';

const allowedTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const resumeUpload = multer({
  storage: multer.memoryStorage(),
  // Keep the multipart request under Vercel Functions' 4.5 MB body limit.
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new AppError('Resume must be a PDF or DOCX file', 400));
    }
    cb(null, true);
  }
});
