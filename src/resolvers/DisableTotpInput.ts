import { InputType, Field } from "type-graphql";

@InputType()
export default class DisableTotpInput {
  @Field()
  password!: string;
}
