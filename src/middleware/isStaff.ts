import { MiddlewareFn } from "type-graphql";
import { MyContext } from "../types";
import { AuthenticationError } from 'apollo-server-express';
import { User } from "../entites/user";

export const isStaff: MiddlewareFn<MyContext> = async ({ context }, next) => {
    const user = await context.em.findOne(User, { id: context.req.session.userId });
    if(user.permissions.includes("STAFF")) {
        return {
            errors: [
                {
                    field: "unauthenticated",
                    message: "Invalid permissions"
                }
            ]
        }
    }
    return next();
}
