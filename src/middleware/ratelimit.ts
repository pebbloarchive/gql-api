import { MiddlewareFn } from "type-graphql";
import { MyContext } from "../types";
import { getGraphQLRateLimiter } from "graphql-rate-limit";

// import Redis from 'ioredis';

// const redis = new Redis();

// export const ratelimit: (limit?: number) => MiddlewareFn<MyContext> = (
//     limit = 5
// ) => async({  context: { req }, info }, next) => {
//     const key = `ratelimit:${info.fieldName}:${req.ip}`;
//     const current = await redis.incr(key);
//     console.log(current)
//     if(current >= limit) {
//         throw({ message: 'You are being rate limited.', expires: '10' });
//     }
//     else if(current === 1) {
//         await redis.expire(key, 60);
//     }
//     return next();
// }
