import { Migration } from '@mikro-orm/migrations';

export class Migration20201121181928 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "blocked" text not null default \'[]\', add column "following" text not null default \'[]\', add column "followers" text not null default \'[]\';');

    this.addSql('create table "post" ("id" varchar(255) not null, "author" text not null, "content" text not null, "media" text not null default \'[]\', "likes" text not null default \'[]\', "shares" text not null default \'[]\', "subs" jsonb null default \'[{}]\', "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null);');
    this.addSql('alter table "post" add constraint "post_pkey" primary key ("id");');
  }

}
