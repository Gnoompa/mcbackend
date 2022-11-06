import { isNotLaterThan1Day } from "./index";

describe("Time util", () => {
  it("isLaterThan1Hour", async () => {
    const date = new Date();
    date.setTime(date.getTime() - 24 * 59 * 60 * 1000);
    const notLater = isNotLaterThan1Day(date);
    expect(notLater).toBe(true);

    date.setTime(date.getTime() - 24 * 60000);
    const later = isNotLaterThan1Day(date);
    expect(later).toBe(false);
  });
});
