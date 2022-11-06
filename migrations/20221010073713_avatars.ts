import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("avatars", function (table) {
    table.string("id");
    table.string("owner");
    table.string("network");
    table.string("name");
    table.integer("xp");
    table.primary(["id", "network"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("avatars");
}
