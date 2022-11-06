import { onchain_config } from "../contracts";

export type LootboxProbabilities = {
  avatar_land: number;
  avatar: number;
  land: number;
};

const getLootboxPercentage = (): LootboxProbabilities => {
  const probabilities = process.env.LOOTBOX_PROBABILITIES ?? "25|2|1";
  const [avatar_land, avatar, land] = probabilities.split("|");
  return {
    avatar_land: +avatar_land,
    avatar: +avatar,
    land: +land
  };
};

export type RarityProbabilities = {
  common: number;
  rare: number;
  legendary: number;
};

export type Mission2Settings = typeof settings.missions["2"];

const getRarityPercentage = (): RarityProbabilities => {
  const probabilities = process.env.RARITY_PROBABILITIES ?? "50|19|1";
  const [common, rare, legendary] = probabilities.split("|");
  return {
    common: +common,
    rare: +rare,
    legendary: +legendary
  };
};

const settings = {
  SERVER_PRIVATE_KEY: process.env.SERVER_WALLET_PRIVATE_KEY || "0x0123456789012345678901234567890123456789012345678901234567890123",
  limits: {
    avatarMissions: process.env.AVATARS_MISSION_LIMITS || 4
  },
  lootbox_probabilities: getLootboxPercentage(),
  rarity_probabilities: getRarityPercentage(),
  missions: {
    "0": {
      timeToComplete: process.env.MISSION_0_DELAY ? +process.env.MISSION_0_DELAY : 290000, // time to complete 1st mission in milliseconds
      pingDelay: process.env.PING_DELAY ? +process.env.PING_DELAY : 90 // seconds! (TTL in REDIS), if no ping has been sent from page in this period -> cancel mission
    },
    "1": {
      timeToComplete: process.env.MISSION_1_DELAY ? +process.env.MISSION_1_DELAY : 290000, // time to complete 1st mission in milliseconds
      attempts: process.env.MISSION_1_ATTEMPTS ? +process.env.MISSION_1_ATTEMPTS : 4, // attempts to guess the password
      wordLength: process.env.MISSION_1_WORDLENGTH ? +process.env.MISSION_1_WORDLENGTH : 5,
      wordsCount: process.env.WORDS_COUNT ? +process.env.WORDS_COUNT : 7 // how many words we take to the user
    },
    "2": {
      timeToComplete: process.env.MISSION_2_DELAY ? +process.env.MISSION_2_DELAY : 25 * 60 * 1000, // time to complete 2st mission in milliseconds
      moves: process.env.MISSION_2_MOVES ? +process.env.MISSION_2_MOVES : 125, // initial moves amount
      dynamites: process.env.MISSION_2_DYNAMITES ? +process.env.MISSION_2_DYNAMITES : 1,
      scans: {
        amount: 2,
        cost: 5
      },
      fuel: {
        amount: process.env.MISSION_2_RESOURCES_FUEL ? +process.env.MISSION_2_RESOURCES_FUEL : 3,
        moves_to_mine: 1,
        added_moves: 10
      },
      worm: {
        retreatPenalty: 7
      },
      resources: {
        common: {
          amount: process.env.MISSION_2_RESOURCES_COMMON ? +process.env.MISSION_2_RESOURCES_COMMON : 5,
          moves_to_mine: 6,
          rewards_percents: 9
        },
        rare: {
          amount: process.env.MISSION_2_RESOURCES_RARE ? +process.env.MISSION_2_RESOURCES_RARE : 3,
          moves_to_mine: 10,
          rewards_percents: 18
        },
        legendary: {
          amount: process.env.MISSION_2_RESOURCES_LEGENDARY ? +process.env.MISSION_2_RESOURCES_LEGENDARY : 2,
          moves_to_mine: 15,
          rewards_percents: 28
        }
      },
      missionReward: (transportHubLevel: number) => {
        if (transportHubLevel === 1) return 200;
        if (transportHubLevel === 2) return 300;
        if (transportHubLevel === 3) return 400;
        return 0;
      },
      missionDailyLimit: process.env.MISSION_2_DAILY_LIMITS ? +process.env.MISSION_2_DAILY_LIMITS : 1
    }
  },
  missionReward: () => {
    if (["polygon", "mumbai"].includes(onchain_config.current_network)) return 160;
    return 100;
  },
  avatarRewardPenalties: {
    "0": 0.75,
    "1": 1
  }
};

export default settings;
