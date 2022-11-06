import { currentLevelFromXp, xpIncrementFromLevel } from "./formula";

const xpMultiplierByMission = (level: number): number => {
  switch (level) {
    case 0:
      return 1;
    case 1:
      return 1.2;
    default:
      return 1;
  }
};

export const calculateXpIncrement = (currentXp: number, missionId: number): number => {
  const currentLevel = currentLevelFromXp(currentXp);
  const increment = Math.round(xpIncrementFromLevel(currentLevel) * xpMultiplierByMission(missionId));
  return missionId === 2 ? increment * 2 : increment;
};
