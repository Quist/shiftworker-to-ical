import { shiftworkerService } from "./shiftworker/shiftworkerService";
import { toIcal } from "./ical/ical";
import { ArgumentParser } from "./utils/argumentParser";
import { ShiftworkerDbRepository } from "./shiftworker/db/db";

const start = async () => {
  const args = ArgumentParser.parseArguments();
  const service = shiftworkerService(
    new ShiftworkerDbRepository(args.inputFilePath)
  );
  const shifts = await service.getShifts();
  const output = toIcal(shifts);
  console.log(output);
};

start();
