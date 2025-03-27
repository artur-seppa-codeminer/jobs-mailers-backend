import type { Knex } from "knex";

enum TaskStatus {
    DONE = 'DONE',
    LATE = 'LATE'
}

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tasks', (table) => {
        table.enum('status', Object.values(TaskStatus))
          .nullable()
      });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('tasks', (table) => {
        table.dropColumn('status');
    });
}

