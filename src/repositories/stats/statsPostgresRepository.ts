import { SnapshotPayloadModel } from "src/models/stats/dto/requests/snapshotPayloadModel";
import { POSTGRES_DATA_SOURCE } from "../../datasources/Postgres";
import { Stat, StatModel } from "../../models/stats/model";

import { Configuration, Inject, Injectable } from "@tsed/common";

@Injectable()
export class StatsPostgresRepository {
  private postgresClient: POSTGRES_DATA_SOURCE;

  constructor(@Inject(Configuration) config: Configuration, @Inject(POSTGRES_DATA_SOURCE) connection: POSTGRES_DATA_SOURCE) {
    this.postgresClient = connection;
  }

  async getStats(): Promise<Stat | undefined> {
    const stats = await StatModel(this.postgresClient).first();

    return stats;
  }

  async setStats() {
    // const statModel: StatModel = {};
    // await StatModel(this.postgresClient).insert(statModel).onConflict(["address"]).merge();
  }

  async snapshotStats(stats: SnapshotPayloadModel[]) {
    await this.postgresClient.schema.dropTableIfExists("tmp_user_stats");
    await this.postgresClient.schema.createTableLike("tmp_user_stats", "user_stats");

    return this.postgresClient
      .transaction(async (tx) => {
        tx.table("tmp_user_stats").insert(stats.map((stat) => ({ ...stat, newValue: stat.valueDiff })));

        tx.table("user_stats").insert(
          tx
            .select([
              "user_stats.type",
              "user_stats.source",
              "tmp_user_stats.userId",
              "IFNULL(user_stats.newValue) as oldValue",
              "IFNULL(user_stats.oldValue + tmp_user_stats.newValue, tmp_user_stats.newValue)",
              "SYSDATETIME() AS updatedAt"
            ])
            .table("user_stats")
            .rightJoin("tmp_user_stats", "user_stats.userId", "tmp_user_stats.userId")
        );

        return tx;
      })
      .catch((e) => console.error(e));
  }
}
