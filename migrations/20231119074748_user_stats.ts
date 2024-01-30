import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("user_stats", function (table) {
    table.string("type");
    table.string("source");
    table.string("userId");
    table.string("oldValue");
    table.string("newValue");
    table.dateTime("createdAt").defaultTo(knex.fn.now());
    table.dateTime("updatedAt");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("user_stats");
}
