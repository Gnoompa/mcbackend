import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("stats", function (table) {
    table.string("type");
    table.string("userId");
    table.string("snapshotValue");
    table.string("currentValue");
    table.dateTime("createdAt").defaultTo(knex.fn.now());
    table.dateTime("updatedAt");
    table.integer("updatedAtBlockNumber");
    table.integer("chainId");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("stats");
}
