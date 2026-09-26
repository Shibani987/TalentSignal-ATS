import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

function transporter() {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) return null;
  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: { user: env.smtpUser, pass: env.smtpPass }
  });
}

export async function sendStatusEmail({ to, name, jobTitle, status }) {
  const tx = transporter();
  if (!tx) return { skipped: true, reason: 'SMTP not configured' };
  await tx.sendMail({
    from: env.smtpFrom,
    to,
    subject: `Application update for ${jobTitle}`,
    text: `Hi ${name},\n\nYour application status for ${jobTitle} is now ${status}.\n\nRegards,\nRecruiting team`
  });
  return { sent: true };
}

export async function sendInterviewEmail({ to, name, jobTitle, startsAt, locationOrLink, message }) {
  const tx = transporter();
  if (!tx) return { skipped: true, reason: 'SMTP not configured' };
  await tx.sendMail({
    from: env.smtpFrom,
    to,
    subject: `Interview invitation for ${jobTitle}`,
    text: `Hi ${name},\n\n${message}\n\nTime: ${new Date(startsAt).toLocaleString()}\nLocation/link: ${locationOrLink}\n\nRegards,\nRecruiting team`
  });
  return { sent: true };
}
