import { sleep } from "../utils/sleep";
import { OnChainRepository } from "../repositories/missions/missionsOnchainRepository";
import { Configuration, Inject, Logger, Module } from "@tsed/common";
import { AvatarsPostgresRepository } from "../repositories/missions/avatarsPostgresRepository";

@Module()
export class AvatarsService {
  @Inject(Configuration) config: Configuration;

  @Inject(OnChainRepository)
  private onChainRepo: OnChainRepository;

  @Inject(AvatarsPostgresRepository)
  private avatarsRepo: AvatarsPostgresRepository;

  @Inject(Logger)
  private logger: Logger;

  async $onInit() {
    this.syncOnChainToPostgresLoop().catch((error) => {
      this.logger.error("error in syncOnChainToPostgresLoop:" + error.message);
      throw error;
    });
  }

  async syncOnChainToPostgresLoop() {
    while (true) {
      try {
        await this.syncOnChainToPostgres();
      } catch (error) {
        this.logger.error("avatars.syncOnChainToPostgresLoop error", error.message);
      }
      await sleep(1000);
    }
  }

  async syncOnChainToPostgres() {
    const allAvatars = await this.onChainRepo.getAllAvatars();
    console.log("all avatars", allAvatars);

    await this.avatarsRepo.upsertAvatarsData(allAvatars);

    this.logger.debug("sync onchain to postgres completed");
  }

  async getAllAvatarsCrosschain(address: string) {
    const avatars = await this.avatarsRepo.getAllAvatarsCrosschain({ address });
    return { avatars };
  }
}
