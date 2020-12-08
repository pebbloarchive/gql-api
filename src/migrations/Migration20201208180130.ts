import { Migration } from '@mikro-orm/migrations';

export class Migration20201208180130 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "websocket_token" text not null default \'\'\'\';');
  }

}
