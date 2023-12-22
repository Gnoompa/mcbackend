import { parse } from "csv-parse/lib/sync";
import fs from "fs";

export async function seed(knex) {
  await knex("allowlists")
    .del()
    .insert(
      parse(fs.readFileSync(__dirname + "/1_allowlist_discounted_land.csv"), {
        columns: true,
        skip_empty_lines: true
      })
    );
}
