import * as fs from "fs";

export class ArgumentParser {
  static parseArguments(): ParsedArguments {
    if (process.argv.length <= 2) {
      throw new Error("Missing required parameter: inputFilePath.");
    }
    const inputFilePath = process.argv[2];
    if (!ArgumentParser.fileExist(inputFilePath)) {
      throw new Error(
        `Could not read input file with path '${inputFilePath}'. Does it exist?`
      );
    }
    return { inputFilePath: inputFilePath };
  }

  private static fileExist(path: string) {
    try {
      if (fs.existsSync(path)) {
        return true;
      }
    } catch (err) {
      return false;
    }
  }
}

interface ParsedArguments {
  inputFilePath: string;
}
