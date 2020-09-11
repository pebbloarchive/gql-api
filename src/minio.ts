import { Client } from 'minio';

const Minio = new Client({
  // endPoint: process.env.MINIO_ENDPOINT as string,
  // port: 8888,
  // useSSL: true,
  // accessKey: process.env.MINIO_ACCESS as string,
  // secretKey: process.env.MINIO_SECRET as string,
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: 'minioadmin',
  region: 'us-east1'
});

export const MinioClient = Minio;