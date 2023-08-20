import { exportShiftworkerFileToIcal } from "../index";
import { ArgumentParser } from "../utils/argumentParser";

const start = async () => {
  const args = ArgumentParser.parseArguments();
  const output = await exportShiftworkerFileToIcal(args.inputFilePath, {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  console.log(output);
};

start();
