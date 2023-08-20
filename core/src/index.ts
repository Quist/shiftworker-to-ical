import { convertToIcal } from "./ical/icalWriter";
import { initializeShiftworkerDbRepository } from "./shiftworker/db/db";
import { ShiftworkerExportService } from "./shiftworker/shiftworkerExportService";

/**
 * Main exported function of the module.
 * Use this to convert a Shiftworker database dump into valid ICAL calendar.
 * @param filepath of the Shiftworker database dump.
 * @param options
 */
export const exportShiftworkerFileToIcal = async (
  filepath: string,
  options: ExportShiftworkerFileToIcalOptions
): Promise<string> => {
  const repository = await initializeShiftworkerDbRepository(filepath);
  const service = new ShiftworkerExportService(repository);
  return service
    .exportShifts()
    .then((shifts) => convertToIcal(shifts, { timezone: options.timezone }));
};

interface ExportShiftworkerFileToIcalOptions {
  timezone: string;
}
