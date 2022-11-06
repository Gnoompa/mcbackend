import { currentLevelFromXp, xpIncrementFromLevel } from "./formula";

describe("Level from XP Formula", () => {
  it("should return 1 level on 100 xp ", async () => {
    const level = currentLevelFromXp(100);
    expect(level).toEqual(1);
  });

  it("should return 2 level on 1010 xp ", async () => {
    const level = currentLevelFromXp(1010);
    expect(level).toEqual(2);
  });

  it("should return 100 level on very big xp ", async () => {
    const level = currentLevelFromXp(10000000000000);
    expect(level).toEqual(100);
  });
});

describe("Increment from Level Formula", () => {
  it("should return correct ramdimized increment on 100 xp ", async () => {
    const level = currentLevelFromXp(100);
    for (let i = 0; i < 100; i++) {
      const inc = xpIncrementFromLevel(level);
      expect(inc).toBeGreaterThanOrEqual(230);
      expect(inc).toBeLessThanOrEqual(300);
    }
  });
});
