import md5 from "md5";

// type Seconds = number;

const stringToIntHash = (str: string, lowerbound: number, upperbound: number): number => {
  let result = 0;
  for (let i = 0; i < str.length; i++) {
    result = result + str.charCodeAt(i);
  }
  return (result % (upperbound - lowerbound)) + lowerbound;
};

// export const timeToDayHourInSeconds = (hour: number): Seconds => {
//   const hourTime = new Date();
//   hourTime.setHours(hour);
//   hourTime.setMinutes(0);
//   hourTime.setSeconds(0);
//   hourTime.setMilliseconds(0);
//   const result = Math.round((hourTime.getTime() - new Date().getTime()) / 1000);
//   return result < 0 ? result + 60 * 60 * 24 : result;
// };

// export const timeToMidnightInSeconds = (): Seconds => {
//   return timeToDayHourInSeconds(24);
// };

// export const timeToLandMissionsLimitsReset = (landId: number): Seconds => {
//   return timeToDayHourInSeconds(stringToIntHash(md5(landId.toString()), 1, 24));
// };

export const landResetHour = (landId: number): number => {
  const hour = stringToIntHash(md5(landId.toString()), 1, 24);
  return hour === 24 ? 0 : hour;
};

// export const timeWhenLandMissionsLimitsReset = (landId: number): Date => {
//   const resetHour = stringToIntHash(md5(landId.toString()), 1, 24);
//   const date = new Date();
//   if (date.getHours() >= resetHour) {
//     date.setHours(resetHour, 0, 0);
//   } else {
//     date.setDate(date.getDate() - 1);
//     date.setHours(resetHour, 0, 0);
//   }
//   return date;
// };

export const isNotLaterThan1Day = (date: Date): boolean => {
  const diff = new Date().getTime() - date.getTime();
  return diff <= 24 * 60 * 60 * 1000;
};
