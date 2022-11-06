const isChanceWin = (probabilityPerents: number): boolean => Math.random() * 100 < probabilityPerents;

export const calculateWordsSettings = (
  initialWordLength: number,
  initialWordsCount: number,
  avatarLevel: number
): { wordLength: number; wordsCount: number } => {
  let wordLength = initialWordLength;
  let wordsCount = initialWordsCount;

  if (avatarLevel < 10) {
    return { wordLength, wordsCount };
  }

  if (avatarLevel >= 10 && avatarLevel < 20) {
    if (isChanceWin(10)) {
      wordsCount += 1;
    }

    if (isChanceWin(5)) {
      wordLength += 1;
    }
  }

  if (avatarLevel >= 20 && avatarLevel < 30) {
    if (isChanceWin(20)) {
      wordsCount += 1;
    }
    if (isChanceWin(7.5)) {
      wordLength += 1;
    }
  }

  if (avatarLevel >= 30 && avatarLevel < 40) {
    if (isChanceWin(30)) {
      wordsCount += 1;
    } else if (isChanceWin(10)) {
      wordsCount += 2;
    }

    if (isChanceWin(10)) {
      wordLength += 1;
    } else if (isChanceWin(5)) {
      wordLength += 2;
    }
  }

  if (avatarLevel >= 40 && avatarLevel < 50) {
    if (isChanceWin(40)) {
      wordsCount += 1;
    } else if (isChanceWin(15)) {
      wordsCount += 2;
    }

    if (isChanceWin(12.5)) {
      wordLength += 1;
    } else if (isChanceWin(7.5)) {
      wordLength += 2;
    }
  }

  if (avatarLevel >= 50) {
    if (isChanceWin(50)) {
      wordsCount += 1;
    } else if (isChanceWin(20)) {
      wordsCount += 2;
    }

    if (isChanceWin(15)) {
      wordLength += 1;
    } else if (isChanceWin(10)) {
      wordLength += 2;
    }
  }

  return { wordLength, wordsCount };
};
