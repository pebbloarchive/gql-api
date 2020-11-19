import { Entity, SerializedPrimaryKey, Property, PrimaryKey } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Post {
	@Field(() => String)
	@PrimaryKey()
	id!: string;

	@Field((() => String))
	@Property({ type: 'text' })
	author!: string;

	@Field(() => String)
	@Property({ type: 'text' })
	content!: string;

	// @Field(() => Array)
	// @Property({ type: 'text' })
	// attachments!: string[];

	// TODO: make this its own interface with data like username etc. -> Shares
	// @Field()
	// @Property({ type: 'text' })
	// shares!: string[]; 

	@Field(() => String)
	@Property({ type: 'date' })
	createdAt = new Date();

	@Field(() => String)
	@Property({ type: 'date', onUpdate: () => new Date() })
	updatedAt = new Date();

	@Field(() => String)
	@Property({ type: 'text' })
	type!: string;
}
