import { Query, Resolver } from "type-graphql";

@Resolver()
export class ExResolver {
    @Query(() => String)
    hello() {
        return "world";
    }
}
