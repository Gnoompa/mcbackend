export const getSimilarity = (word: string, password: string): number => {
  return word.split("").reduce((acc, val, index) => {
    return val === password[index] ? acc + 1 : acc;
  }, 0);
};
