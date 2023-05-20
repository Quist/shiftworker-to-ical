export class ArgumentParser {
  static parseArguments(): ParsedArguments {
    if (process.argv.length <= 2) {
      throw new Error("Usage: input output");
    }
    console.log(process.argv);
    return { inputFilePath: process.argv[2] }; // To do: check if file exists.
  }
}

interface ParsedArguments {
  inputFilePath: string;
}
