import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config/env.js';

const hasS3 = Boolean(env.awsRegion && env.awsAccessKeyId && env.awsSecretAccessKey && env.s3Bucket);
const s3 = hasS3 ? new S3Client({
  region: env.awsRegion,
  credentials: { accessKeyId: env.awsAccessKeyId, secretAccessKey: env.awsSecretAccessKey }
}) : null;

export async function uploadPrivateFile({ key, buffer, contentType }) {
  if (!hasS3) {
    const target = path.join(process.cwd(), 'uploads', key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, buffer);
    return { key, demoMode: true };
  }
  await s3.send(new PutObjectCommand({
    Bucket: env.s3Bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'private'
  }));
  return { key, demoMode: false };
}

export async function signedResumeUrl(key) {
  if (!hasS3) return `/api/files/demo/${encodeURIComponent(key)}`;
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: env.s3Bucket, Key: key }), { expiresIn: 10 * 60 });
}

export async function sendPrivateFile({ key, fileName, res }) {
  if (hasS3) {
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
