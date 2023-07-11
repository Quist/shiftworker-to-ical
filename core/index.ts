import { convertToIcal } from "./src/ical/ical";
import { initializeShiftworkerDbRepository } from "./src/shiftworker/db/db";
import { ShiftworkerExportService } from "./src/shiftworker/shiftworkerExportService";

export const exportShiftworkerFileToIcal = async (
  filepath: string
): Promise<string> => {
  const repository = await initializeShiftworkerDbRepository(filepath);
  const service = new ShiftworkerExportService(repository);
  return service.exportShifts().then((shifts) => convertToIcal(shifts));
};
