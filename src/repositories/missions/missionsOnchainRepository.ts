import { Avatar } from "./../../models/missions/common/avatar.model";
import { Land } from "./../../models/missions/common/land.model";
import { ONCHAIN_DATA_SOURCE } from "../../datasources/onchain";
import { Inject, Injectable, Logger, PlatformCache } from "@tsed/common";
import { BigNumber } from "ethers";

export enum RARITY {
  COMMON,
  RARE,
  LEGENDARY
}

export enum GEAR_TYPE {
  ROCKET_FUEL = 0,
  ENGINE_FURIOUS = 1,
  WD_40 = 2,
  TITANIUM_DRILL = 3,
  DIAMOND_DRILL = 4,
  LASER_DRILL = 5,
  SMALL_AREA_SCANNER = 6,
  MEDIUM_AREA_SCANNER = 7,
  LARGE_AREA_SCANNER = 8,
  ULTRASONIC_TRANSMITTER = 9,
  INFRARED_TRANSMITTER = 10,
  VIBRATION_TRANSMITTER = 11,
  THE_NEBUCHADNEZZAR = 12,
  THE_WRAITH = 13,
  POLYMINER = 14
}

export enum GEAR_CATEGORY {
  ENGINE = 0,
  DRILL = 1,
  SCANNER = 2,
  TRANSMITTER = 3,
  TRANSPORT = 4
}

export type Gear = {
  id: number;
  type: GEAR_TYPE;
  category: GEAR_CATEGORY;
  durability: number;
  locked: boolean;
};

export type LockedGears = {
  transport: Gear;
  gear1: Gear;
  gear2: Gear;
  gear3: Gear;
};

const Gear = {
  from_chain: (id: any, gearRaw: any): Gear => {
    return {
      id: parseInt(id),
      type: parseInt(gearRaw.gearType) as GEAR_TYPE,
      category: parseInt(gearRaw.category) as GEAR_CATEGORY,
      durability: parseInt(gearRaw.durability),
      locked: gearRaw.locked
    };
  }
};

@Injectable()
export class OnChainRepository {
  private contracts: ONCHAIN_DATA_SOURCE;
  @Inject()
  cache: PlatformCache;

  constructor(private logger: Logger, @Inject(ONCHAIN_DATA_SOURCE) _contracts: ONCHAIN_DATA_SOURCE) {
    this.contracts = _contracts;
  }

  async getLandsData(allLandsIds: number[]): Promise<Land[]> {
    const result = [];
    for (let part = 0; part < 100; part++) {
      const lands = Array(210)
        .fill("")
        .map((_, i) => part * 210 + i + 1)
        .filter((id) => allLandsIds.includes(id));

      if (!lands.length) continue;

      const availableMissionsResponse = <
        { availableMissionCount: BigNumber; owner: string; isPrivate: boolean; revshare: BigNumber; transportHubLevel: BigNumber }[]
      >await this.contracts["MSN"].getLandsData(lands);

      // this.logger.debug({ event: "getLandsData", step: part });
      const responseWithLandId = availableMissionsResponse.map((data, index) => ({
        owner: data.owner,
        id: lands[index],
        availableMissionCount: +data.availableMissionCount.toString(),
        isPrivate: data.isPrivate,
        revshare: +data.revshare.toString(),
        transportHubLevel: parseInt(data.transportHubLevel.toString())
      }));

      result.push(...responseWithLandId);
    }
    return result;
  }

  async getAvatarCurrentXP(params: { avatarId: number }) {
    const { avatarId } = params;

    const xps = await this.contracts["CM"].getXP([avatarId]);
    return +xps[0];
  }

  async getAllLandIds(): Promise<number[]> {
    this.logger.debug("getAllLandIds started");
    const allTokens: number[] = [];
    let start = 0;
    while (true) {
      try {
        const data = await this.contracts["MC"].allTokensPaginate(start, start + 1000);
        // this.logger.debug({ event: "allTokensPaginate", step: start });

        allTokens.push(...data.map((id: string) => parseInt(id)));
        start += 1000;
        if (start >= 21000) {
          // this.logger.debug("getAllLandIds completed");
          return allTokens;
        }
      } catch (error) {
        this.logger.error("getAllLandIds.error", error.message);
      }
    }
  }

  async getAvatarOwnerAddress(params: { avatarId: number }): Promise<string> {
    const { avatarId } = params;

    const owner = await this.contracts["MCLN"].ownerOf(avatarId);
    return owner;
  }

  async getLandOwnerAddress(params: { landId: number }): Promise<string> {
    const { landId } = params;

    const owner = await this.contracts["MC"].ownerOf(landId);
    return owner;
  }

  async isAvatarInCryochamber(avatarId: number): Promise<boolean> {
    const cachedValue = await this.cache.get(avatarId.toString());
    if (cachedValue) return cachedValue === "true";

    const isInCryo = await this.isAvatarInCryochamberNotCached(avatarId);
    this.logger.debug("isAvatarInCryochamber", { avatarId, isInCryo });

    await this.cache.set(avatarId.toString(), String(isInCryo));
    return isInCryo;
  }

  async isAvatarInCryochamberNotCached(avatarId: number): Promise<boolean> {
    const isInCryo = await this.contracts["CRYO"].isAvatarInCryoChamber(avatarId);

    return isInCryo;
  }

  async getLockedGears(address: string): Promise<LockedGears> {
    const result = await this.contracts["CM"].getLockedGears(address);

    const lockedGears: LockedGears = {
      transport: Gear.from_chain(result[0][0], result[1][0]),
      gear1: Gear.from_chain(result[0][1], result[1][1]),
      gear2: Gear.from_chain(result[0][2], result[1][2]),
      gear3: Gear.from_chain(result[0][3], result[1][3])
    };

    console.log({ lockedGears });
    // console.log("is transport", lockedGears.transportId?.category === GEAR_CATEGORY.TRANSPORT);

    return lockedGears;
  }

  async getTransportCondition(address: string): Promise<number> {
    const condition = await this.contracts["CM"].getTransportCondition(address);
    return parseInt(condition);
  }

  async getTransportHubLevel(landId: number): Promise<number> {
    const landAttributes = await this.contracts["GM"].getAttributesMany([landId]);
    return parseInt(landAttributes.transport);
  }

  // avatars sync for profile
  async getAllAvatars(): Promise<Avatar[]> {
    this.logger.debug("getAllAvatarsIds started");
    const avatarsSupply = await this.contracts["MCLN"].totalSupply();
    console.log("avatarsSupply", parseInt(avatarsSupply));
    const allTokens: Avatar[] = [];
    let start = 0;
    while (true) {
      try {
        const data = await this.contracts["CM"].allTokensPaginate(start, start + 100);
        this.logger.debug({ event: "avatars.allTokensPaginate", step: start, data });

        allTokens.push(
          ...data[0].map((id: BigNumber, index: number) => ({
            id: parseInt(id.toString()),
            name: data[1][index].name,
            xp: parseInt(data[1][index].xp),
            owner: data[1][index].owner
          }))
        );

        start += 100;
        if (start >= avatarsSupply) {
          this.logger.debug("getAllAvatars completed");
          return allTokens;
        }
      } catch (error) {
        this.logger.error("getAllAvatarsIds.error", error.message);
      }
    }
  }
}
