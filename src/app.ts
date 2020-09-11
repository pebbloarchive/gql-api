import express from 'express';
import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import { resolve } from 'path';
import Logger from '@pebblo/logger'
import Database from './database';
import { Flake } from './util';
// import Redis from 'ioredis';
import { connectRedis  } from './redis';
import { MinioClient } from './minio';
import busboy from 'connect-busboy';

if (process.env.NODE_ENV !== 'production') {
  const { config } = require('dotenv')
  config({ path: resolve(__dirname, '../.env') });
}

import v1 from './routers/v1';

const app = express();

const port: number = 3000;

/**
 * Middlewares
 */
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(busboy());

const main = async () => {

  // @ts-ignore
  global.db = new Database(process.env.DB_URL as string);
  // @ts-ignore
  await db.connect();

  // @ts-ignore
  global.flake = new Flake({
    nodeId: 42,
    timeOffset: 1593561600 * 1000
  });

  connectRedis();

  app.use('/1.0', v1);

  app.listen(port, () => {
    Logger('APP', `API Running on port ${port}`, false, ['cyan'])
  });
}

main();

