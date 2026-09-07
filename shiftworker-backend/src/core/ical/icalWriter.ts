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

export const DEFAULT_CALENDAR_NAME = "Shiftworker";
const MAX_CALENDAR_NAME_LENGTH = 60;

export const convertToIcal = (
  shifts: Shift[],
  config: ToIcalConfig
): string => {
  const events = shifts.map((shift) => convertToVEvent(shift, config));
  const calendarName = escapeText(
    sanitizeCalendarName(config.calendarName) ?? DEFAULT_CALENDAR_NAME
  );
  // NAME is the standard property (RFC 7986), X-WR-CALNAME the de facto one
  // that most calendar apps read. Both are emitted so subscribed calendars
  // show a readable name instead of the URL they were imported from.
  return `BEGIN:VCALENDAR
PRODID:-//hacksw/handcal//NONSGML v1.0//EN
VERSION:2.0
NAME:${calendarName}
X-WR-CALNAME:${calendarName}
${events.join("")}END:VCALENDAR`;
};

/**
 * Trims a user supplied calendar name and strips characters that cannot appear
 * in an iCal property value. Returns undefined when nothing usable is left.
 */
export const sanitizeCalendarName = (
  calendarName?: string
): string | undefined => {
  if (!calendarName) {
    return undefined;
  }
  const sanitized = calendarName
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_CALENDAR_NAME_LENGTH)
    .trim();
  return sanitized.length > 0 ? sanitized : undefined;
};

/**
 * Escapes a TEXT property value according to RFC 5545 section 3.3.11.
 */
const escapeText = (value: string): string =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");

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
  calendarName?: string;
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
