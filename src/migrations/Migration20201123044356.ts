import { Migration } from '@mikro-orm/migrations';

export class Migration20201123044356 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" drop constraint if exists "user_following_check";');
    this.addSql('alter table "user" alter column "following" type varchar(255) using ("following"::varchar(255));');
    this.addSql('alter table "user" alter column "following" set default \'[]\';');
    this.addSql('alter table "user" alter column "following" set not null;');
  }

}
