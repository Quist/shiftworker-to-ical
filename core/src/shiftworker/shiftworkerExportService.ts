import { ShiftworkerRepository, ShiftDB, ShifttypeDB } from "./db/db";
import { isAfterYesterday } from "../utils/dateUtil";
import { Dayjs } from "dayjs";
const dayjs = require("dayjs");
var customParseFormat = require("dayjs/plugin/customParseFormat");
var utc = require("dayjs/plugin/utc");
var timezone = require("dayjs/plugin/timezone"); // dependent on utc plugin
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

export class ShiftworkerExportService {
  private repository: ShiftworkerRepository;
  private config: Config;
  constructor(repository: ShiftworkerRepository, config: Config) {
    this.repository = repository;
    this.config = config;
  }
  async exportShifts(): Promise<Shift[]> {
    const shifts = await this.repository.getShifts();
    const shifttypes = await this.repository.getShifttypes();
    const mappedShifts = this.mapShifts(shifts, shifttypes).filter((shift) =>
      isAfterYesterday(shift.start.toDate())
    );

    if (this.config.debug) {
      this.printShifttypes(shifttypes);
      this.printShifts(mappedShifts);
    }
    return mappedShifts;
  }

  private mapShifts(shifts: ShiftDB[], shifttypes: ShifttypeDB[]): Shift[] {
    return shifts.map((shift): Shift => {
      const shifttype = shifttypes.find(
        (type) => type.primarykey === shift.shifttype
      );
      if (!shifttype) {
        throw new Error(`Could not find shifttype for ${shift.shifttype}`);
      }
      const { start, end } = parseDates(shift, shifttype);
      return {
        start: start,
        end: end,
        summary: shifttype?.description || "Ukjent vakt",
      };
    });
  }

  private printShifttypes(shifttypes: ShifttypeDB[]) {
    console.log(`\n🫡 Printing ${shifttypes.length} shifttypes`);
    shifttypes.forEach((shifttype) => {
      console.log(
        `${shifttype.description}: ${shifttype.start} - ${shifttype.end}`
      );
    });
    console.log("\n");
  }

  private printShifts(shifts: Shift[]) {
    console.log(`\n🙆‍♀️ Extracted in total ${shifts.length} shifts`);
    shifts.forEach((shift) => {
      console.log(`${shift.summary}: ${shift.start} - ${shift.end}`);
    });
    console.log("\n");
  }
}

const parseDates = (shift: ShiftDB, shifttype: ShifttypeDB) => {
  const shiftStart = parseDate(shift.date, shifttype.start);
  const shiftEnd = parseDate(shift.date, shifttype.end);
  if (shiftEnd.isBefore(shiftStart)) {
    return {
      start: shiftStart,
      end: shiftEnd.add(1, "day"),
    };
  }

  return {
    start: shiftStart,
    end: shiftEnd,
  };
};

const parseDate = (shiftDateRaw: string, shifttypeStart: string) => {
  const rawString = `${shiftDateRaw.split(" ")[0]} ${shifttypeStart}`;
  return dayjs(rawString, "MM-DD-YYYY HH:mm:ss ").tz("EUROPE/BERLIN");
};

export interface Shift {
  start: Dayjs;
  end: Dayjs;
  summary: string;
}

interface Config {
  debug: boolean;
}
