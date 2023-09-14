import { convertToIcal, ToIcalConfig, ValidTimeZone } from "./ical/icalWriter";
import { initializeShiftworkerDbRepository } from "./shiftworker/db/db";
import { ShiftworkerExportService } from "./shiftworker/shiftworkerExportService";
import { failure, Result, success } from "./utils/result";

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
  const service = new ShiftworkerExportService(repository, { debug: false });
  return service.exportShifts().then((shifts) => {
    const configValidationResult = mapToValidConfig(options);
    if (configValidationResult.ok) {
      return convertToIcal(shifts, configValidationResult.value);
    }
    throw Error(configValidationResult.error);
  });
};

const mapToValidConfig = (
  config: ExportShiftworkerFileToIcalOptions
): Result<ToIcalConfig, string> => {
  const result = ValidTimeZone.create(config.timezone);
  if (result.ok) {
    return success({ timezone: result.value });
  }
  return failure(result.error);
};

interface ExportShiftworkerFileToIcalOptions {
  timezone: string;
}
