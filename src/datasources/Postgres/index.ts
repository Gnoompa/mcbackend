import { Configuration, registerProvider } from "@tsed/di";
import { Logger } from "@tsed/logger";

import knex, { Knex } from "knex";

export const POSTGRES_DATA_SOURCE = Symbol.for("PostgresDataSource");
export type POSTGRES_DATA_SOURCE = Knex;

let pg: Knex;

registerProvider<POSTGRES_DATA_SOURCE>({
  provide: POSTGRES_DATA_SOURCE,
  type: "postgres:datasource",
  deps: [Configuration, Logger],
  async useAsyncFactory(configuration: Configuration, logger: Logger) {
    const POSTGRES_URL = configuration.get("postgres").url;
    pg = knex({
      client: "pg",
      debug: process.env.KNEX_LOG_LEVEL === "debug",
      connection: {
        connectionString: POSTGRES_URL,
        ssl: false
      },
      searchPath: ["knex", "public"]
    });

    logger.info("Connected postgres");

    return pg;
  },
  hooks: {
    $onDestroy() {
      return pg.destroy();
    }
  }
});
