import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("stats", function (table) {
    table.string("id");
    table.string("type");
    table.string("source");
    table.integer("old_value");
    table.integer("new_value");
    table.dateTime("created_at").defaultTo(knex.fn.now());
    table.dateTime("updated_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("stats");
}
