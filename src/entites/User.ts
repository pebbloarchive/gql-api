import { Entity, Enum, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

export enum Permissions {
    USER = 10,
    SUPPORT = 20,
    MODERATOR = 50,
    ADMIN = 100
}

@ObjectType()
@Entity()
export class User {
    @Field()
    @PrimaryKey()
    id!: string;

    @Field(() => String)
    @Property({ type: 'date' })
    createdAt = new Date();

    @Field(() => String)
    @Property({ type: 'date', onUpdate: () => new Date() })
    updatedAt = new Date();
    
    @Field()
    @Property({ type: 'text', default: "''" })
    name!: string;

    @Field()
    @Property({ type: 'text', unique: true })
    username!: string;

    @Field()
    @Property({ type: 'text', unique: true })
    email!: string;

    @Property({ type: 'text' })
    password!: string;

    @Field()
    @Property({ type: 'text', default: "''" })
    location: string;

    @Field()
    @Property({ type: 'text', default: 'Attracting people from around the world together to share stories, meet new friends & have a laugh.' })
    description: string;

    @Field()
    @Property({ type: 'boolean', default: false })
    private: boolean;

    @Field()
    @Property({ type: 'boolean', default: false })
    verified: boolean;

    @Field(() => String)
	@Property({ type: 'text', default: "[]" })
    blocked!: string[];
    
    @Field(() => String)
	@Property({ type: 'text', default: "[]" })
    following!: string[];
    
    @Field(() => String)
	@Property({ type: 'text', default: "[]" })
	followers!: string[];

    // @Enum()
    // @Field()
    // @Property({ type: 'boolean', default: Permissions.USER })
    // staff!: Permissions;

    @Property({ type: 'boolean', default: false })
    suspended: boolean;

    @Field()
    @Property({ type: 'text', default: "''" })
    totpSecret: string;
}