import { getSimilarity } from "./similarity";

describe("similarity function", () => {
  it("should return 0 similarity", async () => {
    const similarity = getSimilarity("abcd", "defg");
    expect(similarity).toEqual(0);
  });

  it("should return 3 similarity", async () => {
    const similarity = getSimilarity("abcdefgh", "a1c1e111");
    expect(similarity).toEqual(3);
  });
});
