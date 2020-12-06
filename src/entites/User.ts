import { ArrayType, Cascade, Collection, Entity, Enum, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

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
    @Property({ type: 'text', default: "''" })
    avatar!: string;

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

    @Field(() => [String])
	@Property({ type: ArrayType })
    blocked = [];
    
    @Field(() => [String])
	@Property({ type: ArrayType })
    followers = [];

    @Field(() => [String])
	@Property({ type: ArrayType })
    following = []

    // @ManyToOne(() => Following, { cascade: [Cascade.ALL] })
    // following = new Collection<Following>(this);

    @Field(() => [String])
    @Property({ type: ArrayType, default: ["USER"] })
    permissions!: string[];

    // @Field(() => [String])
    // @Property({ type: 'text', default: "[]", nullable: true })
    // posts!: string[];

    @Property({ type: 'boolean', default: false })
    suspended: boolean;

    @Field()
    @Property({ type: 'text', default: "''" })
    totpSecret: string;

    @Field()
    @Property({ type: 'boolean', default: false })
    totpEnabled: boolean;
}
