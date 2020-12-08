import { Migration } from "@mikro-orm/migrations";

export class Migration69 extends Migration {
  async up(): Promise<void> {
    // this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');
    this.addSql(
      'alter table "user" ADD COLUMN IF NOT EXISTS "websocketToken" TEXT; NOTICE: COLUMN "websocketToken" OF relation "user" already EXISTS, skipping ALTER TABLE'
    );
  }
}
