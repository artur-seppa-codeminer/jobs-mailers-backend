import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("tasks", (table) => {
    table.increments("id").primary();
    table
      .integer("ownerId")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("title").notNullable();
    table.text("description").nullable();
    table.integer("priority").notNullable();
    table.timestamp("dueDate").nullable();
    table.timestamp("completedAt").nullable();
    table.timestamps({
      useCamelCase: true,
      useTimestamps: true,
      defaultToNow: true,
    });
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("tasks");
}
