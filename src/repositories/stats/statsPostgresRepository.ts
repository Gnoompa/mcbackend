import { Configuration, Inject, Injectable } from "@tsed/common";
import { PlatformCache } from "@tsed/platform-cache";
import { min } from "lodash";
import { POSTGRES_DATA_SOURCE } from "../../datasources/Postgres";
import { StatSnapshotModel } from "../../models/stats/dto/requests/statSnapshot";
import { StatModel, StatType, TStat } from "../../models/stats/model";

const PAGE_LIMIT = 20;
const PAGE_MAX_LIMIT = 1_000;

@Injectable()
export class StatsPostgresRepository {
  private postgresClient: POSTGRES_DATA_SOURCE;

  @Inject()
  cache: PlatformCache;

  constructor(@Inject(Configuration) config: Configuration, @Inject(POSTGRES_DATA_SOURCE) connection: POSTGRES_DATA_SOURCE) {
    this.postgresClient = connection;
  }

  async getRelativeStats(type: StatType, source: string, id: string, neighbourLimit: number = 3): Promise<TStat[]> {
    const cacheKey = `${type}_${source}_${id}_${neighbourLimit}`;
    const cache = await this.cache.get(cacheKey);

    if (typeof cache == "string") {
      return JSON.parse(cache);
    } else {
      const singleStat = await StatModel(this.postgresClient)
        .fromRaw("(SELECT ROW_NUMBER() OVER (ORDER BY new_value DESC) AS order, * FROM stats) AS stats")
        .leftJoin("profiles", "profiles.address", "stats.id")
        .columns("stats.*", "profiles.name")
        .where({ type, source, id })
        .first();

      const result = singleStat
        ? [
            singleStat,
            ...(neighbourLimit && neighbourLimit > 1
              ? [
                  ...(await StatModel(this.postgresClient)
                    .fromRaw("(SELECT ROW_NUMBER() OVER (ORDER BY new_value DESC) AS order, * FROM stats) AS stats")
                    .leftJoin("profiles", "profiles.address", "stats.id")
                    .columns("stats.*", "profiles.name")
                    .where("order", ">", singleStat?.order)
                    .orderBy("order", "asc")
                    .limit(min([neighbourLimit, 50]) as number)
                    .select()),
                  ...(await StatModel(this.postgresClient)
                    .fromRaw("(SELECT ROW_NUMBER() OVER (ORDER BY new_value DESC) AS order, * FROM stats) AS stats")
                    .leftJoin("profiles", "profiles.address", "stats.id")
                    .columns("stats.*", "profiles.name")
                    .where("order", "<", singleStat?.order)
                    .orderBy("order", "desc")
                    .limit(min([neighbourLimit, 50]) as number)
                    .select())
                ]
              : [])
          ]
        : [];

      this.cache.set(cacheKey, JSON.stringify(result), { ttl: 1800 });

      return result;
    }
  }

  async getStats(type: StatType, source: string, from: number = 0, limit: number = PAGE_LIMIT): Promise<{ stats: TStat[]; size: number }> {
    const cacheKey = `${type}_${source}`;
    const cache = await this.cache.get(cacheKey);
    let stats: TStat[] = [];

    if (typeof cache == "string") {
      stats = JSON.parse(cache);
    } else {
      stats = await StatModel(this.postgresClient)
        .fromRaw("(SELECT ROW_NUMBER() OVER (ORDER BY new_value DESC) AS order, * FROM stats) AS stats")
        .leftJoin("profiles", "profiles.address", "stats.id")
        .orderBy("new_value", "desc")
        .where({ type, source })
        .select("stats.*", "profiles.name");

      this.cache.set(cacheKey, JSON.stringify(stats), { ttl: 86400 });
    }

    return { size: stats.length, stats: stats.splice(from, min([limit, PAGE_MAX_LIMIT])) };
  }

  async snapshotStats(stats: StatSnapshotModel[], type: StatType, source: string, snapshotWindow?: number) {
    const snapshotWindowCacheKey = `${source}_${type}_snapshotWindow`;
    let cachedSnapshotWindow = await this.cache.get(snapshotWindowCacheKey);

    snapshotWindow && this.cache.set(snapshotWindowCacheKey, snapshotWindow, { ttl: snapshotWindow });

    await this.postgresClient.schema.dropTableIfExists("tmp_stats");
    await this.postgresClient.schema.createTableLike("tmp_stats", "stats");

    await this.postgresClient.table("tmp_stats").insert(stats.map(({ id, new_value }) => ({ type, source, id, old_value: 0, new_value })));

    const updatedStats = await this.postgresClient
      .columns([
        "tmp_stats.type",
        "tmp_stats.source",
        "tmp_stats.new_value",
        this.postgresClient.raw(cachedSnapshotWindow ? "stats.old_value" : "COALESCE(stats.new_value, tmp_stats.new_value) AS old_value"),
        this.postgresClient.raw("COALESCE(tmp_stats.id, stats.id) AS id"),
        this.postgresClient.raw("COALESCE(stats.created_at, tmp_stats.created_at) AS created_at"),
        this.postgresClient.raw("CURRENT_TIMESTAMP AS updated_at")
      ])
      .from("stats")
      .rightJoin("tmp_stats", function () {
        this.on("stats.id", "=", "tmp_stats.id").andOn("stats.type", "=", "tmp_stats.type").andOn("stats.source", "=", "tmp_stats.source");
      })
      .select();

    return this.postgresClient
      .transaction(async (tx) => (await tx.table("stats").truncate(), await tx.table("stats").insert(updatedStats)))
      .then(() => this.cache.reset())
      .catch((error) => console.error("Failed stats snapshot transaction: ", error));
  }
}
