export const isWinByChoice = (percents: number): boolean => {
  return Math.random() * 100 < percents;
};
