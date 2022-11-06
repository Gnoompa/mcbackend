import { v4 } from "uuid";

export enum LootCode {
  avatar_common,
  avatar_rare,
  avatar_legendary,
  land_common,
  land_rare,
  land_legendary,
  none
}

const getLootCode = (lootCode: LootCode): string => {
  switch (lootCode) {
    case LootCode.avatar_common:
      return "01";
    case LootCode.avatar_rare:
      return "02";
    case LootCode.avatar_legendary:
      return "03";
    case LootCode.land_common:
      return "23";
    case LootCode.land_rare:
      return "24";
    case LootCode.land_legendary:
      return "25";
    default:
      return "00";
  }
};

export const createBytesMessage = (params: {
  avatarId: number;
  landId: number;
  xpIncrement: number;
  lootCode: LootCode;
  rewards: { landReward: number; avatarReward: number };
  missionId: number;
}): string => {
  const { avatarId, landId, xpIncrement, lootCode, rewards, missionId } = params;
  const randomBytes = v4().replace(new RegExp("-", "g"), "");
  const avatarBytes = avatarId.toString().padStart(5, "0");
  const landBytes = landId.toString().padStart(5, "0");
  const xpBytes = xpIncrement.toString().padStart(8, "0");
  const lootCodeBytes = getLootCode(lootCode);
  const avatarRewardBytes = rewards.avatarReward.toString().padStart(4, "0");
  const landOwnerRewardBytes = rewards.landReward.toString().padStart(4, "0");
  const missionIdBytes = missionId.toString().padStart(2, "0");
  const futureBytes = "".padStart(16, "0");
  return (
    randomBytes +
    avatarBytes +
    avatarBytes +
    landBytes +
    xpBytes +
    lootCodeBytes +
    avatarRewardBytes +
    landOwnerRewardBytes +
    missionIdBytes +
    futureBytes
  );
};
