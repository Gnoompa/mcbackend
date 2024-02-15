import { Configuration, Inject, Logger, Module } from "@tsed/common";
import { StatSnapshotModel } from "../models/stats/dto/requests/statSnapshot";
import { StatType, TStat } from "../models/stats/model";
import { KVPostgresRepository } from "../repositories/kv/kvPostgresRepository";
import { StatsPostgresRepository } from "../repositories/stats/statsPostgresRepository";

export type StatToSnapshot = Partial<TStat> & {
  valueDiff?: number;
};
@Module()
export class StatsService {
  @Inject(Configuration) config: Configuration;

  @Inject(StatsPostgresRepository)
  private statsRepo: StatsPostgresRepository;

  @Inject(KVPostgresRepository)
  private kvRepo: KVPostgresRepository;

  @Inject(Logger)
  private logger: Logger;

  async snapshotStats(stats: StatSnapshotModel[], type: StatType, source: string) {
    return await this.statsRepo.snapshotStats(stats, type, source);
  }

  async getRelativeStats(type: StatType, source: string, id: string, neighbourLimit?: number) {
    return await this.statsRepo.getRelativeStats(type, source, id, neighbourLimit);
  }

  async getStats(type: StatType, source: string, fromValue: number, limit?: number) {
    return await this.statsRepo.getStats(type, source, fromValue, limit);
  }
}
