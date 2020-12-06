import { InputType, Field } from "type-graphql";
@InputType()
export default class UsernamePasswordInput {
  @Field()
  email!: string;
  @Field()
  username!: string;
  @Field()
  password!: string;
} 