import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';

export async function extractResumeText(file) {
  if (file.mimetype === 'application/pdf') {
    const parsed = await pdfParse(file.buffer);
    return sanitizeText(parsed.text);
  }
  const parsed = await mammoth.extractRawText({ buffer: file.buffer });
  return sanitizeText(parsed.value);
}

export function sanitizeText(text = '') {
  return text.replace(/\s+/g, ' ').trim().slice(0, 14000);
}
