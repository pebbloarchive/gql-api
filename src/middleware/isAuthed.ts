import { MiddlewareFn } from "type-graphql";
import { MyContext } from "../types";
import { AuthenticationError } from 'apollo-server-express';

export const isAuthed: MiddlewareFn<MyContext> = async ({ context }, next) => {
    if(!context.req.session.userId) {
        throw new AuthenticationError('Unauthorized')
    }
    return next();
}