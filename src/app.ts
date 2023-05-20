import { createDBRepository } from "./shiftworker/db/db";
import { shiftworkerService } from "./shiftworker/shiftworkerService";
import { toIcal } from "./ical/ical";
import { ArgumentParser } from "./utils/argumentParser";

const start = async () => {
  const args = ArgumentParser.parseArguments();
  const service = shiftworkerService(createDBRepository(args.inputFilePath));
  const shifts = await service.getShifts();
  const output = toIcal(shifts);
  console.log(output);
};

start();
