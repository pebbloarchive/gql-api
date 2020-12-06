import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import { Request, Response } from "express";
import { Redis } from "ioredis";

export type MyContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
    req: Request & { session: { userId: string } };
    res: Response;
    redis: Redis;
    // postLoader: ReturnType<typeof initPostLoader>;
}

