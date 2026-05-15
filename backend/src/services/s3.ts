import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mock_access_key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mock_secret_key',
  },
});

export const uploadFileToS3 = async (file: Express.Multer.File): Promise<string> => {
  if (!process.env.AWS_S3_BUCKET_NAME) {
    console.warn("AWS_S3_BUCKET_NAME is not set, mocking S3 upload.");
    return `mock-s3-path/${randomUUID()}-${file.originalname}`;
  }

  const key = `documents/${randomUUID()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);
  return key;
};
