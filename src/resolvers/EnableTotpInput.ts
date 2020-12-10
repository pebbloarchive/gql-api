import { InputType, Field } from "type-graphql";

@InputType()
export default class EnableTotpInput {
  @Field()
  secret!: string;
  @Field()
  token!: string;
}
