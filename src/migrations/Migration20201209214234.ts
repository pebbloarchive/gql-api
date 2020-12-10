import { Migration } from '@mikro-orm/migrations';

export class Migration20201209214234 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "websocket_token" text not null default \'\'\'\';');
    this.addSql('alter table "user" drop column "posts";');
  }

}
