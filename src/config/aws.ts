import { S3Client } from '@aws-sdk/client-s3';

// Konfiguracja AWS
export const awsConfig = {
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  },
};

// Konfiguracja S3
export const s3Client = new S3Client(awsConfig);

// Konfiguracja S3
export const s3Config = {
  bucketName: import.meta.env.VITE_S3_BUCKET || '',
  region: import.meta.env.VITE_S3_REGION || 'us-east-1',
}; 