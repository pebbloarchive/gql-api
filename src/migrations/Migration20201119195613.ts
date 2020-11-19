import { Migration } from '@mikro-orm/migrations';

export class Migration20201119195613 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("id" varchar(255) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "name" text not null default \'\'\'\', "username" text not null, "email" text not null, "password" text not null, "location" text not null default \'\'\'\', "description" text not null default \'Attracting people from around the world together to share stories, meet new friends & have a laugh.\', "private" bool not null default false, "verified" bool not null default false, "suspended" bool not null default false, "totp_secret" text not null default \'\'\'\');');
    this.addSql('alter table "user" add constraint "user_pkey" primary key ("id");');
    this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');
    this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');
  }

}
