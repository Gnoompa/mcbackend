import { CronJob } from "cron";
import knex from "knex";

const pgConnection = knex({
  client: "pg",
  debug: process.env.KNEX_LOG_LEVEL === "debug",
  connection: {
    connectionString: "postgres://admin:admin@localhost:5432/mc",
    ssl: false
  },
  searchPath: ["knex", "public"]
});

function runJob(id: string, params: Parameters<typeof CronJob["from"]>[0]) {
  return CronJob.from({
    ...params,
    onTick: () => {
      console.info(`[${new Date().toLocaleString()}] CRON JOB (${id}) TICKED`);

      (params.onTick as CallableFunction)?.();
    }
  });
}

function snapshotStats() {
  pgConnection("kv").insert({key: "cron", value: Math.random()}).catch(console.error)
}

function initShares() {
  runJob("USER_SHARES", {
    cronTime: "*/1 * * * *",
    // 0 0 */1 * *
    onTick: () => {
      snapshotStats();
    },
    start: true,
    timeZone: "Europe/London"
  });

  // this.contracts.GM.on("AddShares", (tokenId, owner, shares) => console.log(tokenId, owner, shares));
}

export default function main() {
  initShares();
}
