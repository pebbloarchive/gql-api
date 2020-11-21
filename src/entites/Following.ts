import { PrimaryKey, Property, SerializedPrimaryKey, Unique } from '@mikro-orm/core';
import { Field } from 'type-graphql';

@Unique({ properties: ['user'] })
export class Following {
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