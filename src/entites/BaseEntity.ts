import { PrimaryKey, Property, SerializedPrimaryKey } from '@mikro-orm/core';
import { Field } from 'type-graphql';

export abstract class BaseEntity {
    @Field(() => String)
	@PrimaryKey()
    id!: string;
    
    @Field(() => String)
    @Property()
    createdAt = new Date();
  
    @Field(() => String)
    @Property({ onUpdate: () => new Date() })
    updatedAt = new Date();
}