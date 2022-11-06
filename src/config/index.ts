import { readFileSync } from "fs";
import { envs } from "./envs";
import loggerConfig from "./logger";
import redisConfig from "./redis";
import postgresConfig from "./postgres";
import missionsConfig from "./missions";
import { onchain_config } from "./contracts";

const pkg = JSON.parse(readFileSync("./package.json", { encoding: "utf8" }));

export const config: Partial<TsED.Configuration> = {
  version: pkg.version,
  envs,
  logger: loggerConfig,
  redis: redisConfig,
  postgres: postgresConfig,
  missions: missionsConfig,
  onchain: onchain_config,
  cache: {
    ttl: 300, // default TTL
    store: "memory"
  },
  instance_id: process.env.APP_INSTANCE_ID ? Number(process.env.APP_INSTANCE_ID) : 0 // 0 is primary instance, will refresh onChain data
};
