import { toIcal as _toICal } from "./src/ical/ical";
import { shiftworkerService } from "./src/shiftworker/shiftworkerService";
import { createShiftworkerDbRepository } from "./src/shiftworker/db/db";

export const toICal = async (filepath: string): Promise<string> => {
  const repository = await createShiftworkerDbRepository(filepath);
  const service = shiftworkerService(repository);
  return service.getShifts().then((shifts) => _toICal(shifts));
};
