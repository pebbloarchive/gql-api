import { MikroORM } from "@mikro-orm/core";
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { Post, User } from "./entites";
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
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
	metadataProvider: TsMorphMetadataProvider,
        highlighter: new SqlHighlighter(),
        debug: true
} as Parameters<typeof MikroORM.init>[0];