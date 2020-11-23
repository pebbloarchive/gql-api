import 'reflect-metadata';
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
import { MyContext } from './types';
import { GraphQLError } from 'graphql';
import "dotenv-safe/config";

const app = express();

const main = async () => {
    const orm = await MikroORM.init(mikroConfig);
    await orm.getMigrator().up();

    const RedisStore = connectRedis(session);
    const redisClient = _redis.createClient();
    const redis = new Redis();

    app.use(
        session({
            name: 'qid',
            store: new RedisStore({ client: redisClient, disableTouch: true }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
                httpOnly: true,
                secure:  false,
                sameSite: 'lax'
            },
            saveUninitialized: false,
            secret: 'pebbloiscool',
            resave: false
        })
    )


    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            emitSchemaFile: true,
            resolvers: [PostResolver, UserResolver],
            validate: false
        }),
        // playground: false,
        debug: false,
        context: ({ req, res }) => ({ em: orm.em, req, res, redis }),
        formatError: (error: ApolloError) => {
            if(error.originalError instanceof ApolloError) {
                return error;
            }
            console.log(error);
            return new ApolloError('Internal server error', 'INTERNAL_SERVER_ERROR');
        }
    });

    apolloServer.applyMiddleware({ app, path: '/api/query' });

    app.listen(4000, () => console.log('Server started on port 4000'));
}

main().catch(err => console.error(err));