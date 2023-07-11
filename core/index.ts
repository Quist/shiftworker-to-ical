import { toIcal as _toICal } from "./src/ical/ical";
import { createShiftworkerDbRepository } from "./src/shiftworker/db/db";
import { ShiftworkerExportService } from "./src/shiftworker/shiftworkerExportService";

export const toICal = async (filepath: string): Promise<string> => {
  const repository = await createShiftworkerDbRepository(filepath);
  const service = new ShiftworkerExportService(repository);
  return service.exportShifts().then((shifts) => _toICal(shifts));
};
