import { ShiftworkerToIcalService } from "./shiftworkerToIcalService";
import { LocalFileService } from "./fileService";
import * as fs from "fs";

const localClient = async (argument: string): Promise<string> => {
  const service = new ShiftworkerToIcalService(new LocalFileService());
  const inputData = fs.readFileSync(argument);
  return await service.convert(inputData);
};

localClient(process.argv[process.argv.length - 1]);
