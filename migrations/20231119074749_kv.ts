import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("kv", function (table) {
    table.string("key").primary();
    table.string("value");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("kv");
}
