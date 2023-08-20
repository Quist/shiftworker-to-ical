import { v4 as uuidv4 } from "uuid";
const dayjs = require("dayjs");
var customParseFormat = require("dayjs/plugin/customParseFormat");
var utc = require("dayjs/plugin/utc");
var timezone = require("dayjs/plugin/timezone"); // dependent on utc plugin
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
import { Shift } from "../shiftworker/shiftworkerExportService";
import { failure, Result, success } from "../utils/result";
import { isValidTimeZone } from "../utils/dateUtil";

export const convertToIcal = (
  shifts: Shift[],
  config: ToIcalConfig
): string => {
  const events = shifts.map((shift) => convertToVEvent(shift, config));
  return `BEGIN:VCALENDAR
PRODID:-//hacksw/handcal//NONSGML v1.0//EN
VERSION:2.0
${events.join("")}END:VCALENDAR`;
};

export const convertToVEvent = (shift: Shift, config: ToIcalConfig) => {
  const summary = config?.prefix
    ? `${config.prefix}${shift.summary}`
    : shift.summary;

  return `BEGIN:VEVENT
DTSTAMP:${dayjs().format("YYYYMMDDTHHmmss")}Z
DTSTART;TZID=${config.timezone}:${shift.start.format("YYYYMMDDTHHmmss")}
DTEND;TZID=${config.timezone}:${shift.end.format("YYYYMMDDTHHmmss")}
UID:${uuidv4()}@quister.org
SUMMARY:${summary}
END:VEVENT
`;
};

export interface ToIcalConfig {
  prefix?: string;
  timezone: ValidTimeZone;
}

export class ValidTimeZone {
  private readonly timezone: string;
  private constructor(timezone: string) {
    this.timezone = timezone;
  }

  public toString = (): string => {
    return this.timezone;
  };

  static create = (timezone: string): Result<ValidTimeZone, string> => {
    if (isValidTimeZone(timezone)) {
      return success(new ValidTimeZone(timezone));
    }
    return failure(`Invalid timezone: ${timezone}`);
  };
}
