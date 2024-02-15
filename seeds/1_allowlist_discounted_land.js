import { parse } from "csv-parse/lib/sync";
import fs from "fs";

export async function seed(knex) {
  await knex("allowlists")
    .del()
    .then(() =>
      knex("allowlists").insert(
        parse(fs.readFileSync(__dirname + `/1_allowlist_discounted_land_${process.env.NETWORK}.csv`), {
          columns: true,
          skip_empty_lines: true
        })
      )
    );
}
