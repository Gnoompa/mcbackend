import { parse } from "csv-parse/lib/sync";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

export async function seed(knex) {
  const shares = parse(fs.readFileSync(__dirname + `/2_user_shares_${process.env.NETWORK}.csv`), {
    columns: true,
    skip_empty_lines: true
  });

  await knex("user_stats")
    .del()
    .then(() =>
      knex("user_stats").insert(
        shares.map((share) => {
          let canonicalShare = { ...share };

          delete canonicalShare.blockNumber;

          return canonicalShare;
        })
      )
    );

  await knex("kv").where("key", `stats/shares/${process.env.NETWORK}/last_snapshot_block_number`).del();
  await knex("kv").insert({ key: `stats/shares/${process.env.NETWORK}/last_snapshot_block_number`, value: shares[0].blockNumber });
}
