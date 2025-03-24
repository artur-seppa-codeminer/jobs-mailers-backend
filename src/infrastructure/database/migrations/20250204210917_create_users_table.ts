import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.enum("role", ["ADMIN", "USER"]).notNullable();
    table.enum("status", ["ACTIVE", "INACTIVE"]).notNullable();
    table.string("username").notNullable().unique();
    table.string("encryptedPassword").notNullable();
    table.timestamps({
      useCamelCase: true,
      useTimestamps: true,
      defaultToNow: true,
    });
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("users");
}
