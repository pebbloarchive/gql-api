import { Migration } from '@mikro-orm/migrations';

export class Migration20201129215713 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "post" ("id" varchar(255) not null, "author" text not null, "content" text not null, "media" text[] not null, "likes" text[] not null, "shares" text[] not null, "subs" jsonb null default \'[{}]\', "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null);');
    this.addSql('alter table "post" add constraint "post_pkey" primary key ("id");');
  }

}
