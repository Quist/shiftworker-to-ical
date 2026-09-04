import { ShiftworkerToIcalService } from "./shiftworkerToIcalService";
import { LocalFileService } from "./fileService";
import * as fs from "fs";

const localClient = async (
  argument: string,
  calendarName?: string
): Promise<string> => {
  const service = new ShiftworkerToIcalService(new LocalFileService());
  const inputData = fs.readFileSync(argument);
  return await service.convert(inputData, {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    calendarName,
  });
};

const [filepath, calendarName] = process.argv.slice(2);
localClient(filepath, calendarName);
