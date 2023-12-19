import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("allowlists", function (table) {
    table.string("userId");
    table.string("leaf");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("allowlists");
}
