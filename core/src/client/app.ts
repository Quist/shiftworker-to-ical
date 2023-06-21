import { toICal } from "../../index";
import { ArgumentParser } from "../utils/argumentParser";

const start = async () => {
  const args = ArgumentParser.parseArguments();
  const output = await toICal(args.inputFilePath);
  console.log(output);
};

start();
