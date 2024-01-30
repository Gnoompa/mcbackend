import { Configuration, Inject, Logger, Module } from "@tsed/common";
import { SnapshotPayloadModel } from "src/models/stats/dto/requests/snapshotPayloadModel";
import { Stat } from "../models/stats/model";
import { StatsPostgresRepository } from "../repositories/stats/statsPostgresRepository";

export type StatToSnapshot = Partial<Stat> & {
  valueDiff?: number;
};
@Module()
export class StatsService {
  @Inject(Configuration) config: Configuration;

  @Inject(StatsPostgresRepository)
  private statsRepo: StatsPostgresRepository;

  @Inject(Logger)
  private logger: Logger;

  async snapshotStats(stats: SnapshotPayloadModel[]): Promise<any> {
    return this.statsRepo.snapshotStats(stats);
  }
}
