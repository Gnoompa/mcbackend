import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("profiles", function (table) {
    table.string("address");
    table.string("name");
    table.string("twitter");
    table.string("discord");
    table.primary(["address"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("profiles");
}
