import { parse } from "csv-parse/sync";
import fs from "fs";
import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("allowlists")
    .del()
    .insert(
      parse(fs.readFileSync(__dirname + "/0_allowlist_discounted_land.csv"), {
        columns: true,
        skip_empty_lines: true
      })
    );
}
