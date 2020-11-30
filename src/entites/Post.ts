import { Entity, SerializedPrimaryKey, Property, PrimaryKey, ArrayType } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
class Owner {
	@Field(() => String, { nullable: true })
	id: string
	@Field(() => Boolean, { nullable: true })
	verified: boolean;
	@Field(() => String, { nullable: true })
	avatar: string;
	@Field(() => String, { nullable: true })
	username: string
	// @Field(() => Boolean, { nullable: true })
	// reported: boolean;
	// @Field(() => Boolean, { nullable: true })
	// pending: boolean;
	// @Field(() => Boolean, { nullable: true })
	// restricted: boolean;
}

interface OwnerType {
	id: string
	verified: boolean;
	avatar: string;
	username: string
	// reported: boolean;
	// pending: boolean;
	// restricted: boolean;
}

@ObjectType()
class Subs {
	@Field(() => String, { nullable: true })
	id: string;
	@Field(() => Owner, { nullable: true })
	owner: OwnerType;
	@Field(() => String, { nullable: true })
	content: string;
	@Field(() => String, { nullable: true })
	likes: string[];
	@Field(() => String, { nullable: true })
	shares: string[];
	@Field(() => String, { nullable: true })
	createdAt: string;
}

@ObjectType()
class Creator {
	@Field(() => String, { nullable: true })
	id: string;
	@Field(() => String, { nullable: true })
	username: string;
	@Field(() => String, { nullable: true })
	name: string;
	@Field(() => String, { nullable: true })
	avatar: string;
	@Field(() => Boolean, { nullable: true })
	verified: boolean;	
}

@ObjectType()
@Entity()
export class Post {
	@Field(() => String)
	@PrimaryKey()
	id!: string;

	@Field((() => String))
	@Property({ type: 'text' })
	author!: string;

	@Field(() => Creator)
	@Property({ type: 'json', default: "{}", nullable: true })
	creator!: object;

	@Field(() => String)
	@Property({ type: 'text' })
	content!: string;

	@Field(() => [String])
	@Property({ type: ArrayType })
	media = [];

	@Field(() => [String])
	@Property({ type: ArrayType })
	likes = [];

	@Field(() => [String])
	@Property({ type: ArrayType })
	shares = [];

	@Field(() => [Subs])
	@Property({ type: 'json', default: "[{}]", nullable: true })
	subs!: [object];

	@Field(() => String)
	@Property({ type: 'date' })
	created_at: string;

	@Field(() => String)
	@Property({ type: 'date' })
	updated_at: string;
}
