import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table("lands", (table) => {
    table.integer("transport_hub_level").defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table("lands", (table) => {
    table.dropColumn("transport_hub_level");
  });
}
