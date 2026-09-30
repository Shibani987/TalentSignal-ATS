import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { access, mkdir, writeFile } from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import { env } from '../config/env.js';

const hasS3 = Boolean(env.awsRegion && env.awsAccessKeyId && env.awsSecretAccessKey && env.s3Bucket);
const hasCloudinary = Boolean(env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret);
const storageProvider = env.storageProvider === 'auto'
  ? (hasCloudinary ? 'cloudinary' : hasS3 ? 's3' : 'local')
  : env.storageProvider;
const s3 = hasS3 ? new S3Client({
  region: env.awsRegion,
  credentials: { accessKeyId: env.awsAccessKeyId, secretAccessKey: env.awsSecretAccessKey }
}) : null;

function cloudinaryPublicId(key) {
  return key.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9/_-]/g, '_');
}

function signCloudinaryParams(params) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return crypto.createHash('sha1').update(`${payload}${env.cloudinaryApiSecret}`).digest('hex');
}

async function uploadToCloudinary({ key, buffer, contentType }) {
  const timestamp = Math.round(Date.now() / 1000);
  const publicId = cloudinaryPublicId(key);
  const params = {
    public_id: publicId,
    timestamp
  };
  const form = new FormData();
  form.append('file', new Blob([buffer], { type: contentType }));
  form.append('api_key', env.cloudinaryApiKey);
  for (const [name, value] of Object.entries(params)) form.append(name, String(value));
  form.append('signature', signCloudinaryParams(params));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/raw/upload`, {
    method: 'POST',
    body: form
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error?.message || 'Cloudinary upload failed');
  }
  return {
    key: publicId,
    originalKey: key,
    url: body.secure_url,
    provider: 'cloudinary',
    demoMode: false
  };
}

export async function uploadPrivateFile({ key, buffer, contentType }) {
  if (storageProvider === 'cloudinary' && hasCloudinary) {
    return uploadToCloudinary({ key, buffer, contentType });
  }

  if (storageProvider === 'cloudinary' && !hasCloudinary) {
    throw new Error('Cloudinary storage is selected but CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET is missing.');
  }

  if (storageProvider !== 's3' || !hasS3) {
    const target = path.join(process.cwd(), 'uploads', key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, buffer);
    return { key, provider: 'local', demoMode: true };
  }
  await s3.send(new PutObjectCommand({
    Bucket: env.s3Bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'private'
  }));
  return { key, provider: 's3', demoMode: false };
}

export async function signedResumeUrl(key) {
  if (storageProvider === 'cloudinary' && hasCloudinary) {
    return `https://res.cloudinary.com/${env.cloudinaryCloudName}/raw/upload/${key}`;
  }
  if (storageProvider !== 's3' || !hasS3) return `/api/files/demo/${encodeURIComponent(key)}`;
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: env.s3Bucket, Key: key }), { expiresIn: 10 * 60 });
}

export async function sendPrivateFile({ key, fileName, res }) {
  if (storageProvider === 'cloudinary' && hasCloudinary) {
    return res.redirect(await signedResumeUrl(key));
  }

  if (storageProvider === 's3' && hasS3) {
    const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: env.s3Bucket, Key: key }), { expiresIn: 10 * 60 });
    return res.redirect(url);
  }

  const root = path.resolve(process.cwd(), 'uploads');
  const target = path.resolve(root, key);
  if (!target.startsWith(root)) {
    return res.status(404).json({ error: { message: 'File not found' } });
  }
  try {
    await access(target);
    return res.download(target, fileName);
  } catch (error) {
    return res.status(404).json({ error: { message: 'Resume file is not available in local demo storage' } });
  }
}
