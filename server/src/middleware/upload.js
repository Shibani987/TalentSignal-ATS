import multer from 'multer';
import { AppError } from '../utils/errors.js';

const allowedTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new AppError('Resume must be a PDF or DOCX file', 400));
    }
    cb(null, true);
  }
});
