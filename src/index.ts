import 'reflect-metadata';
import "dotenv-safe/config";
import { MikroORM } from '@mikro-orm/core';
import mikroConfig from './mikro-orm.config';
import express from 'express';
import { ApolloError, ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import _redis from 'redis';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { COOKIE_NAME, COOKIE_SECRET, IS_PROD } from './constants';
import cors from 'cors';
import datadog from 'express-opentracing';
import tracer from 'dd-trace';
import Logger from './utils/sentryLogger';

const app = express();

const main = async () => {
    const orm = await MikroORM.init(mikroConfig);
    await orm.getMigrator().up();

    const RedisStore = connectRedis(session);
    const redisClient = _redis.createClient();
    const redis = new Redis();

    app.use(cors({
        credentials: true,
        origin: IS_PROD ? 'https://pebblo.org' : 'http://localhost:3000'
    }));

    app.use(datadog({ tracer: tracer }));

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({ client: redisClient, disableTouch: true }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
                httpOnly: true,
                sameSite: 'lax',
                secure:  IS_PROD ? true : false,
                domain: IS_PROD ? '.pebblo.org' : undefined
            },
            saveUninitialized: false,
            secret: COOKIE_SECRET,
            resave: false
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            emitSchemaFile: true,
            resolvers: [PostResolver, UserResolver],
            validate: false
        }),
        introspection: IS_PROD ? true : false,
        // playground: false,
        debug: IS_PROD ? false : true,
        context: ({ req, res }) => ({ em: orm.em, req, res, redis }),
        formatError: (error: ApolloError) => {
            if(error.originalError instanceof ApolloError) {
                return error;
            }
            IS_PROD ? Logger(error) : console.error(error);
            return new ApolloError('Internal server error', 'INTERNAL_SERVER_ERROR');
        }
    });

    apolloServer.applyMiddleware({ app, path: IS_PROD ? '/graphql' : '/api/graphql', cors: false });

    app.listen(4000, () => console.log('Server started on port 4000'));
}

main().catch(err => console.error(err));
