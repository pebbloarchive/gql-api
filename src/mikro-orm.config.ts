import { MikroORM } from "@mikro-orm/core";
import { Post } from "./entites/Post";
import { User } from "./entites/user";
import path from "path";

export default {
        migrations: {
                path: path.join(__dirname, './migrations'),
                pattern: /^[\w-]+\d+\.[tj]s$/,
        }, 
        entities: [Post, User],
        dbName: 'pebblo',
        type: 'postgresql',
        user: 'postgres',
        password: 'djshawn1',
        debug: true
} as Parameters<typeof MikroORM.init>[0];