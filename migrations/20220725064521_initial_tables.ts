import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable("missions", function (table) {
      table.string("id");
      table.integer("avatar_id");
      table.integer("land_id");
      table.integer("mission_id");
      table.string("address");
      table.string("network");
      table.timestamp("started_at");
      table.enu("status", ["started", "completed", "failed"]);
      table.timestamp("finished_at");
      table.jsonb("data");
      table.primary(["id"]);
    })
    .createTable("lands", function (table) {
      table.integer("id");
      table.integer("available_mission_count");
      table.boolean("is_private");
      table.string("owner");
      table.integer("revshare");
      table.string("network");
      table.integer("reset_hour");
      table.timestamp("blocked_at");
      table.primary(["id", "network"]);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("missions").dropTable("lands");
}
