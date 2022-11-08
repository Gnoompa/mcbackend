import { LandsPostgresRepository } from "./../repositories/missions/landsPostgresRepository";
import { Land } from "../models/missions/common/land.model";
import { GetRandomLandIdPayloadModel } from "../models/missions/common/dto/requests/getRandomLandIdPayloadModel";
import { sleep } from "../utils/sleep";
import { OnChainRepository } from "../repositories/missions/missionsOnchainRepository";
import { Configuration, Inject, Logger, Module, BeforeInit } from "@tsed/common";
import { MissionsPostgresRepository } from "../repositories/missions/missionsPostgresRepository";

@Module()
export class LandsService implements BeforeInit {
  private avatarMissionsLimits: number;
  private lockedForMissionStartLands = new Set<number>();

  @Inject(Configuration) config: Configuration;

  @Inject(LandsPostgresRepository)
  private landsRepo: LandsPostgresRepository;

  @Inject(MissionsPostgresRepository)
  private missionsRepo: MissionsPostgresRepository;

  @Inject(OnChainRepository)
  private onChainRepo: OnChainRepository;

  @Inject(Logger)
  private logger: Logger;

  async $beforeInit(): Promise<void> {
    this.avatarMissionsLimits = this.config.get("missions").limits.avatarMissions;
    // await this.syncOnChainToPostgres();
  }

  async $onInit() {
    this.syncOnChainToPostgresLoop().catch((error) => {
      this.logger.error("error in startAllLandsIdsEndlessLoops:" + error.message);
      throw error;
    });
  }

  async syncOnChainToPostgresLoop() {
    while (true) {
      try {
        await this.syncOnChainToPostgres();
      } catch (error) {
        this.logger.error("syncOnChainToPostgresLoop error", error.message);
      }
      await sleep(5000);
    }
  }

  async syncOnChainToPostgres() {
    const allLandsIds = await this.onChainRepo.getAllLandIds();

    // we start to collect limits only after we know all lands ids
    const onChainLandData = await this.onChainRepo.getLandsData(allLandsIds);

    await this.landsRepo.upsertLandsData(onChainLandData);

    this.logger.debug("sync onchain to postgres completed");
  }

  getLandsWithMaxRevshare(lands: Land[]) {
    return lands.reduce(
      (acc, land) => {
        if (land.revshare > acc.maxRevshare) {
          return {
            maxRevshare: land.revshare,
            landsWithMaxRevshares: [land]
          };
        }

        if (land.revshare === acc.maxRevshare) {
          return {
            maxRevshare: acc.maxRevshare,
            landsWithMaxRevshares: [...acc.landsWithMaxRevshares, land]
          };
        }

        return acc;
      },
      {
        maxRevshare: lands[0].revshare,
        landsWithMaxRevshares: [lands[0]]
      }
    ).landsWithMaxRevshares;
  }

  async getRandomLandForMissions_0_1(args: GetRandomLandIdPayloadModel): Promise<number | undefined> {
    const isTopRevsharedLandNeeded = (): boolean => {
      return Math.random() > 0.2;
    };

    const { address, excludedLandId } = args;
    // it shall random land number from ownersMap for the address provided (if there is a land with a valid updateTime < 5 minutes)

    const ownerLands = await this.landsRepo.getAvailableLands({ address, excludedLandId });

    // console.log({ ownerLands });
    this.logger.debug({ event: "getRandomLandForMission", ownerLands });

    if (ownerLands.length) {
      const land = ownerLands[Math.floor(Math.random() * ownerLands.length)];
      this.logger.debug(`land ${land.id} has been choosen from ownersLandWithoutExcludedLand array as random`);
      await this.landsRepo.blockLandFor10Seconds({ landId: land.id });
      return land.id;
    }

    // no actual lands of this owner found, try to find other's lands with public missions settings

    const publicActualLands = await this.landsRepo.getAvailableLands({});

    this.logger.debug({ event: "getRandomLandForMission", publicActualLands });

    if (!publicActualLands.length) return undefined;

    // in 80% get land with top revshare as random from lands with top revshares
    if (isTopRevsharedLandNeeded()) {
      // form array of lands with the similar max revsares
      const landsWithMaxRevshare = this.getLandsWithMaxRevshare(publicActualLands);

      const landId = landsWithMaxRevshare[Math.floor(Math.random() * landsWithMaxRevshare.length)].id;
      await this.landsRepo.blockLandFor10Seconds({ landId });

      return landId;
    }

    // in other 20% get random land with available limits
    const land = publicActualLands[Math.floor(Math.random() * publicActualLands.length)];
    this.logger.debug({ event: "getRandomLandForMission", land });
    await this.landsRepo.blockLandFor10Seconds({ landId: land.id });

    return land.id;
  }

  async getRandomLandForMission_2(args: GetRandomLandIdPayloadModel): Promise<number | undefined> {
    const isTopRevsharedLandNeeded = (): boolean => {
      return Math.random() > 0.5;
    };

    const { address, excludedLandId } = args;
    // it shall random land number from ownersMap for the address provided (if there is a land with a valid updateTime < 5 minutes)

    const ownerLands = await this.landsRepo.getAvailableLandsForMission2({ address, excludedLandId });

    // console.log({ ownerLands });
    this.logger.debug({ event: "getRandomLandForMission2", ownerLands });

    if (ownerLands.length) {
      const land = ownerLands[Math.floor(Math.random() * ownerLands.length)];
      this.logger.debug(`land ${land.id} has been choosen from ownersLandWithoutExcludedLand array as random`);
      await this.landsRepo.blockLandFor10Seconds({ landId: land.id });
      return land.id;
    }

    // no actual lands of this owner found, try to find other's lands with public missions settings

    const publicActualLands = await this.landsRepo.getAvailableLandsForMission2({});

    this.logger.debug({ event: "getRandomLandForMission", publicActualLands });

    if (!publicActualLands.length) return undefined;

    // in 80% get land with top revshare as random from lands with top revshares
    if (isTopRevsharedLandNeeded()) {
      // form array of lands with the similar max revsares
      const landsWithMaxRevshare = this.getLandsWithMaxRevshare(publicActualLands);

      const landId = landsWithMaxRevshare[Math.floor(Math.random() * landsWithMaxRevshare.length)].id;
      await this.landsRepo.blockLandFor10Seconds({ landId });

      return landId;
    }

    // in other 20% get random land with available limits
    const land = publicActualLands[Math.floor(Math.random() * publicActualLands.length)];
    this.logger.debug({ event: "getRandomLandForMission", land });
    await this.landsRepo.blockLandFor10Seconds({ landId: land.id });

    return land.id;
  }

  async getAvatarAvailableMissions(avatarId: number): Promise<number> {
    const missionsStartedToday = await this.missionsRepo.getAvatarMissionsLimitsSpent({ avatarId });
    const availableMissionCount = this.avatarMissionsLimits - missionsStartedToday;
    return availableMissionCount <= 0 ? 0 : availableMissionCount;
  }

  async getLandAvailableMissions(landId: number, missionId: number): Promise<number> {
    if (missionId === 0 || missionId === 1) {
      const missions = await this.landsRepo.getLandAvailableMissions(landId);
      return missions;
    }
    if (missionId === 2) {
      const missions = await this.landsRepo.getLandAvailableMissions2(landId);
      return missions;
    }
    throw new Error("invalid mission id");
  }

  async isLandLockedForMissionStart(landId: number): Promise<boolean> {
    return this.lockedForMissionStartLands.has(landId);
  }

  async lockLandForMissionStart(landId: number) {
    this.lockedForMissionStartLands.add(landId);
  }

  async unlockLandForMissionStart(landId: number) {
    this.lockedForMissionStartLands.delete(landId);
  }

  //crosschain lands  for  profiles
  async getAllLandsCrosschain(address: string) {
    const lands = await this.landsRepo.getAllLandsCrosschain({ address });
    return { lands };
  }
}
