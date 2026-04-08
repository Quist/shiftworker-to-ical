import { convertToIcal, ToIcalConfig, ValidTimeZone } from "./ical/icalWriter";
import { initializeShiftworkerDbRepository } from "./shiftworker/db/db";
import { ShiftworkerExportService } from "./shiftworker/shiftworkerExportService";
import { failure, Result, success } from "./utils/result";

export const exportShiftworkerFileToIcal = async (
  filepath: string,
  options: ExportShiftworkerFileToIcalOptions
): Promise<string> => {
  const repository = await initializeShiftworkerDbRepository(filepath);
  const service = new ShiftworkerExportService(repository, {
    debug: false,
    timezone: options.timezone
  });
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
    return success({
      timezone: result.value,
      prefix: config.prefix
    });
  }
  return failure(result.error);
};

interface ExportShiftworkerFileToIcalOptions {
  timezone: string;
  prefix?: string;
}
