import { MiddlewareFn } from "type-graphql";
import { MyContext } from "../types";
import { AuthenticationError } from 'apollo-server-express';

export const isAuthed: MiddlewareFn<MyContext> = async ({ context }, next) => {
    if(!context.req.session.userId) {
        return {
            errors: [
                {
                    message: "unauthenticated",
                    status: "fail"
                }
            ]
        }
    }
    return next();
}