import Redis, { Redis as RedisType } from 'ioredis';
import Logger from '@pebblo/logger';

let client: RedisType | null = null;

export const connectRedis = () => {
  client = new Redis({
    host: process.env.REDIS_HOST as string || 'localhost',
    port: process.env.REDIS_PORT as any || 6379,
  });
  return Logger('Redis', 'Connected to redis\n', false, ['red']);
}

export const getRedisClient = () => {
  if(client) return client;
  throw new Error('Client isn\'t connected');
}

