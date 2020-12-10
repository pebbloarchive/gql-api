import { MikroORM } from "@mikro-orm/core";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
// import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Post, User } from "./entites";
import path from "path";
import { IS_DEV } from "./constants";

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  type: "postgresql",
  entities: [Post, User],
  /*clientUrl: IS_DEV
    ? "postgresql://postgres:djshawn1@localhost:5432/pebblo"
    : process.env.DATABASE_URL,*/
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "djshawn1",
  dbName: "pebblo",
  highlighter: new SqlHighlighter(),
  debug: IS_DEV ? true : false,
} as Parameters<typeof MikroORM.init>[0];
