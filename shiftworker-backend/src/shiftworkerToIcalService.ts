import fs from "fs";
import { exportShiftworkerFileToIcal } from "./core/index";
import { FileService } from "./fileService";

export class ShiftworkerToIcalService {
  private fileService: FileService;

  constructor(fileService: FileService) {
    this.fileService = fileService;
  }

  public async convert(
    inputData: any,
    options: { timezone: string; calendarName?: string }
  ): Promise<string> {
    const filepath = await this.fileService.writeToTmpFile(inputData);
    try {
      const icalAsString = await exportShiftworkerFileToIcal(filepath, {
        timezone: options.timezone,
        calendarName: options.calendarName,
      });
      const outfile = await this.fileService.writeToStorage(icalAsString, {
        calendarName: options.calendarName,
      });
      console.log(
        `✅ ShiftworkerToIcalService successfully completed and written output to '${outfile}'`
      );
      return outfile;
    } finally {
      fs.unlink(filepath, (err) => {
        if (err) console.error(`Failed to delete tmp file ${filepath}:`, err);
      });
    }
  }
}
