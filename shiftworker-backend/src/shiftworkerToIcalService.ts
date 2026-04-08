import { exportShiftworkerFileToIcal } from "./exportShiftworkerFileToIcal";
import { FileService } from "./fileService";

export class ShiftworkerToIcalService {
  private fileService: FileService;

  constructor(fileService: FileService) {
    this.fileService = fileService;
  }

  public async convert(
    inputData: any,
    options: { timezone: string; prefix?: string }
  ): Promise<string> {
    const filepath = await this.fileService.writeToTmpFile(inputData);
    const icalAsString = await exportShiftworkerFileToIcal(filepath, {
      timezone: options.timezone,
      prefix: options.prefix,
    });
    const outfile = await this.fileService.writeToStorage(icalAsString);
    console.log(
      `✅ ShiftworkerToIcalService successfully completed and written output to '${outfile}'`
    );
    return outfile;
  }
}
