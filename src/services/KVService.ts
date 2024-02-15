import { Configuration, Inject, Logger, Module } from "@tsed/common";
import { KVPostgresRepository } from "../repositories/kv/kvPostgresRepository";

@Module()
export class StatsService {
  @Inject(Configuration) config: Configuration;

  @Inject(KVPostgresRepository)
  private KVRepo: KVPostgresRepository;

  @Inject(Logger)
  private logger: Logger;

  async set(key: string, value: string): Promise<any> {
    await this.KVRepo.set(key, value);
  }

  async get(key: string): Promise<any> {
    await this.KVRepo.get(key);
  }
}
