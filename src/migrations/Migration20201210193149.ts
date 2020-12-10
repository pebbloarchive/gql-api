import { Migration } from '@mikro-orm/migrations';

export class Migration20201210193149 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("id" varchar(255) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "name" text not null default \'\'\'\', "avatar" text not null default \'\'\'\', "username" text not null, "email" text not null, "password" text not null, "location" text not null default \'\'\'\', "description" text not null default \'Attracting people from around the world together to share stories, meet new friends & have a laugh.\', "private" bool not null default false, "verified" bool not null default false, "blocked" text[] not null, "followers" text[] not null, "following" text[] not null, "permissions" text[] not null default \'{USER}\', "suspended" bool not null default false, "websocket_token" text not null default \'\'\'\', "totp_secret" text not null default \'\'\'\', "totp_enabled" bool not null default false);');
    this.addSql('alter table "user" add constraint "user_pkey" primary key ("id");');
    this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');
    this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');

    this.addSql('create table "post" ("id" varchar(255) not null, "author" text not null, "creator" jsonb null default \'{}\', "content" text not null, "media" text[] not null, "likes" text[] not null, "shares" text[] not null, "subs" jsonb null default \'[{}]\', "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null);');
    this.addSql('alter table "post" add constraint "post_pkey" primary key ("id");');
  }

}
