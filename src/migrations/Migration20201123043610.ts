import { Migration } from '@mikro-orm/migrations';

export class Migration20201123043610 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" drop constraint if exists "user_following_check";');
    this.addSql('alter table "user" alter column "following" type text[] using ("following"::text[]);');
    this.addSql('alter table "user" alter column "following" drop not null;');
  }

}
