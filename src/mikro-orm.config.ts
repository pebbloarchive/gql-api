import { MikroORM } from "@mikro-orm/core";
import { Post } from "./entites/Post";
import { User } from "./entites/user";
import path from "path";
import { IS_DEV } from "./constants";

export default {
        migrations: {
                path: path.join(__dirname, './migrations'),
                pattern: /^[\w-]+\d+\.[tj]s$/,
        }, 
        entities: [Post, User],
        clientUrl: process.env.DATABASE_URL,
        debug: IS_DEV ? true : false
} as Parameters<typeof MikroORM.init>[0];