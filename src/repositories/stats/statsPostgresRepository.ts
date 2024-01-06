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

  async snapshot(): Promise<boolean> {
    await StatModel(this.postgresClient).first();

    return true;
  }
}
