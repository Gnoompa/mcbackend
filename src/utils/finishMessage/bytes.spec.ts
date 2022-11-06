import { createBytesMessage, LootCode } from "./bytesMessage";

describe("Bytes message", () => {
  it("should return correct bytes", async () => {
    const message = await createBytesMessage({
      avatarId: 1,
      landId: 20234,
      xpIncrement: 15311925,
      lootCode: LootCode.avatar_rare,
      rewards: { landReward: 90, avatarReward: 20 },
      missionId: 0
    });

    expect(message.length).toEqual(83);
  });
});
