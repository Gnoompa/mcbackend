import { Configuration, Inject, Logger, Module } from "@tsed/common";
import { CronJob } from "cron";
import { ONCHAIN_DATA_SOURCE } from "../datasources/onchain";
import { StatsPostgresRepository } from "../repositories/stats/statsPostgresRepository";

export const CRON_JOB_TZ = "Europe/London";

@Module()
export class StatsService {
  @Inject(Configuration) config: Configuration;

  @Inject(StatsPostgresRepository)
  private statsRepo: StatsPostgresRepository;

  @Inject(Logger)
  private logger: Logger;

  @Inject(ONCHAIN_DATA_SOURCE)
  private contracts: ONCHAIN_DATA_SOURCE;

  async $onInit() {
    // this.init();
  }

  runJob(id: string, params: Parameters<typeof CronJob["from"]>[0]) {
    return CronJob.from({
      ...params,
      onTick: () => {
        this.logger.info(`CRON JOB (${id}) TICKED`);

        (params.onTick as CallableFunction)?.();
      }
    });
  }

  async snapshotStats() {
    // await this.statsRepo.snapshot();
  }

  // async init() {
  //   this.initShares();
  // }

  async initShares() {
    // this.runJob("USER_SHARES", {
    //   cronTime: "*/2 * * * *",
    //   onTick: () => {
    //     console.log("SNAPSHOT")
    //     this.snapshotStats();
    //   },
    //   start: true,
    //   timeZone: CRON_JOB_TZ
    // });

    // this.contracts.GM.on("AddShares", (tokenId, owner, shares) => console.log(tokenId, owner, shares));
  }

  async syncOnChainToPostgres() {
    // const allAvatars = await this.onChainRepo.getAllAvatars();
    // await this.avatarsRepo.upsertAvatarsData(allAvatars);
    // this.logger.debug("sync onchain to postgres completed");
  }
}
