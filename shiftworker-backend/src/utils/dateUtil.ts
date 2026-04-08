import dayjs from "dayjs";
var customParseFormat = require("dayjs/plugin/customParseFormat");
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

export const isAfterYesterday = (date: Date) => {
  const yesterday = dayjs().subtract(1, "day");
  return dayjs(date).isAfter(yesterday);
};

export const isValidTimeZone = (string: string) => {
  try {
    dayjs().tz(string);
    return true;
  } catch (e) {
    return false;
  }
};
