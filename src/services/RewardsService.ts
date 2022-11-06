import { LandsPostgresRepository } from "./../repositories/missions/landsPostgresRepository";
import { LootboxProbabilities, Mission2Settings, RarityProbabilities } from "../config/missions/index";
import { createBytesMessage, LootCode } from "../utils/finishMessage/bytesMessage";
import { calculateXpIncrement } from "../utils/xp";
import { OnChainRepository } from "../repositories/missions/missionsOnchainRepository";
import { Configuration, Inject, Logger, Module } from "@tsed/common";
import { ONCHAIN_CONFIG } from "../config/contracts";
import { ethers } from "ethers";
import { Mission2PostgresRepository } from "../repositories/missions/mission2/mission2PostgresRepository";

@Module()
export class RewardsService {
  // made as public for tests
  private lootboxProbabilities: LootboxProbabilities;
  private rarityProbabilities: RarityProbabilities;

  @Inject(Configuration) config: Configuration;

  @Inject(OnChainRepository)
  private onChainRepo: OnChainRepository;

  @Inject(LandsPostgresRepository)
  private landsRepo: LandsPostgresRepository;

  @Inject(Mission2PostgresRepository)
  private mission2Repo: Mission2PostgresRepository;

  @Inject(Logger)
  private logger: Logger;

  public tokenName: string;
  private wallet: ethers.Wallet;

  $onInit() {
    this.rarityProbabilities = this.config.get("missions").rarity_probabilities;
    this.lootboxProbabilities = this.config.get("missions").lootbox_probabilities;
    const onchain_config = this.config.get<ONCHAIN_CONFIG>("onchain");
    this.tokenName = onchain_config.networks[onchain_config.current_network].tokenName;
    this.wallet = new ethers.Wallet(this.config.get("missions").SERVER_PRIVATE_KEY);
  }

  async lootboxCode(params: { avatarId: number; landId: number }): Promise<LootCode> {
    const { avatarId, landId } = params;
    const [avatarOwner, landOwner] = await Promise.all([
      this.onChainRepo.getAvatarOwnerAddress({ avatarId: +avatarId }),
      this.onChainRepo.getLandOwnerAddress({ landId: +landId })
    ]);

    const randomRarity = (): "common" | "rare" | "legendary" => {
      const num = Math.random() * 100;
      if (num <= this.rarityProbabilities.common) return "common";
      if (num <= this.rarityProbabilities.rare + this.rarityProbabilities.common) return "rare";
      return "legendary";
    };

    const getRarity = (type: "avatar" | "land"): LootCode => {
      if (type === "avatar") {
        switch (randomRarity()) {
          case "common":
            return LootCode.avatar_common;
          case "rare":
            return LootCode.avatar_rare;
          case "legendary":
            return LootCode.avatar_legendary;
        }
      } else {
        switch (randomRarity()) {
          case "common":
            return LootCode.land_common;
          case "rare":
            return LootCode.land_rare;
          case "legendary":
            return LootCode.land_legendary;
        }
      }
    };

    const isMint = (probability: number) => {
      const num = Math.random() * 100;
      return num <= probability;
    };

    if (avatarOwner === landOwner) {
      if (isMint(this.lootboxProbabilities.avatar_land)) {
        return getRarity("avatar");
      }
    }
    if (isMint(this.lootboxProbabilities.avatar)) {
      return getRarity("avatar");
    }
    if (isMint(this.lootboxProbabilities.land)) {
      return getRarity("land");
    }
    return LootCode.none;
  }

  async calculateRewards(args: {
    avatarId: number;
    missionId: number;
    landId: number;
  }): Promise<{ landReward: number; avatarReward: number }> {
    const { missionId, landId, avatarId } = args;
    const land = await this.landsRepo.getLandById(landId);

    if (!land) throw new Error(`calculateRewards: land with id ${landId} not found`);

    if (missionId === 1 || missionId === 0) {
      const missionReward = this.config.get("missions").missionReward();
      const avatarPenalties = this.config.get("missions").avatarRewardPenalties[missionId.toString()];

      this.logger.debug("calculateRewards settings", { missionReward, avatarPenalties });

      const rewards = {
        landReward: Math.round((missionReward * (100 - land.revshare)) / 100),
        avatarReward: Math.round((missionReward * land.revshare * avatarPenalties) / 100)
      };

      this.logger.debug("calculateRewards", { rewards });

      return rewards;
    }

    if (missionId === 2) {
      // mission2 rewards calculation
      const mission = await this.mission2Repo.getMission2Record({ avatarId });
      const resources = mission!.resources;
      const transportHubLevel = await this.landsRepo.getTransportHubLevel(landId);
      console.log("reward land transport hub level", transportHubLevel);
      const missionSettings: Mission2Settings = this.config.get("missions").missions["2"];
      const reward = missionSettings.missionReward(transportHubLevel);
      console.log("reward", { transportHubLevel, reward });

      const commonResourcesPercentage = resources.common / missionSettings.resources.common.amount;
      const rareResourcesPercentage = resources.rare / missionSettings.resources.rare.amount;
      const legendaryResourcesPercentage = resources.legendary / missionSettings.resources.legendary.amount;

      const finalReward =
        (reward * commonResourcesPercentage * missionSettings.resources.common.rewards_percents) / 100 +
        (reward * rareResourcesPercentage * missionSettings.resources.rare.rewards_percents) / 100 +
        (reward * legendaryResourcesPercentage * missionSettings.resources.legendary.rewards_percents) / 100;

      const rewards = {
        landReward: Math.round((finalReward * (100 - land.revshare)) / 100),
        avatarReward: Math.round((finalReward * land.revshare) / 100)
      };

      this.logger.debug("calculateRewards", { rewards });

      return rewards;
    }

    throw new Error("incorrect mission id");
  }

  async createFinishMessage(params: {
    address: string;
    avatarId: number;
    landId: number;
    missionId: number;
  }): Promise<{ response: { name: string; value?: string | undefined; type: "basic" | "accent" }[]; message: string; signature: string }> {
    const { address, avatarId, landId, missionId } = params;
    const avatarXp = await this.onChainRepo.getAvatarCurrentXP({ avatarId });
    const xpIncrement = calculateXpIncrement(avatarXp, missionId);
    const lootCode = missionId === 2 ? LootCode.none : await this.lootboxCode({ avatarId, landId });
    const rewards = await this.calculateRewards({ avatarId, missionId, landId });
    const response: { name: string; value?: string | undefined; type: "basic" | "accent" }[] = [
      { name: "XP earned", value: xpIncrement.toString(), type: "basic" },
      { name: `${this.tokenName} earned`, value: (rewards.avatarReward / 100).toFixed(2).toString(), type: "basic" }
    ];
    if ([LootCode.avatar_legendary, LootCode.avatar_rare, LootCode.avatar_common].includes(lootCode)) {
      response.push({
        name: "Special reward",
        value: "",
        type: "accent"
      });
    }

    const message = createBytesMessage({ avatarId, landId, xpIncrement, lootCode, rewards, missionId });
    const signature = await this.wallet.signMessage(message);

    return { response, message, signature };
  }
}
