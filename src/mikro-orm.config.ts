import { MikroORM } from "@mikro-orm/core";
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Post, User } from "./entites";
import path from "path";
import { IS_DEV } from "./constants";

export default {
        migrations: {
                path: path.join(__dirname, './migrations'),
                pattern: /^[\w-]+\d+\.[tj]s$/,
        }, 
        entities: [Post, User],
        clientUrl: process.env.DATABASE_URL,
	metadataProvider: TsMorphMetadataProvider,
        highlighter: new SqlHighlighter(),
        debug: IS_DEV ? true : false
} as Parameters<typeof MikroORM.init>[0];