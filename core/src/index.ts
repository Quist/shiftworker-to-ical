import { convertToIcal } from "./ical/icalWriter";
import { initializeShiftworkerDbRepository } from "./shiftworker/db/db";
import { ShiftworkerExportService } from "./shiftworker/shiftworkerExportService";

export const exportShiftworkerFileToIcal = async (
  filepath: string
): Promise<string> => {
  const repository = await initializeShiftworkerDbRepository(filepath);
  const service = new ShiftworkerExportService(repository);
  return service.exportShifts().then((shifts) => convertToIcal(shifts));
};
