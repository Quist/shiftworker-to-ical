import fs from "fs";
import crypto from "crypto";
const { Storage } = require("@google-cloud/storage");

const DEFAULT_FILE_NAME = "shiftworker";
const MAX_FILE_NAME_LENGTH = 40;

/**
 * Turns a calendar name into a safe, readable file name. The name only affects
 * the last part of the URL — uniqueness still comes from the random id prefix.
 */
export const toFileName = (calendarName?: string): string => {
  const slug = (calendarName ?? "")
    .toLowerCase()
    .replace(/ø/g, "o")
    .replace(/æ/g, "ae")
    .replace(/å/g, "a")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_FILE_NAME_LENGTH)
    .replace(/-+$/g, "");
  return slug.length > 0 ? slug : DEFAULT_FILE_NAME;
};

export class GCloudFileService implements FileService {
  async writeToStorage(
    icalAsString: string,
    options?: WriteToStorageOptions
  ): Promise<string> {
    const storage = new Storage();
    const id = crypto.randomBytes(16).toString("hex");
    const filePath = `${id}/${toFileName(options?.calendarName)}.ical`;
    await storage
      .bucket("shiftworker-to-ical-generated-output")
      .file(filePath)
      .save(icalAsString, { contentType: "text/calendar; charset=utf-8" });

    return `https://storage.googleapis.com/shiftworker-to-ical-generated-output/${filePath}`;
  }

  writeToTmpFile(input: any): Promise<string> {
    const id = crypto.randomBytes(16).toString("hex");
    const filePath = `/tmp/${id}.txt`;
    return this.writeToFile(input, filePath);
  }

  private writeToFile(input: any, filepath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.writeFile(filepath, input, (err) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          fs.readFileSync(filepath);
          resolve(filepath);
        }
      });
    });
  }
}

export class LocalFileService implements FileService {
  writeToTmpFile(input: any): Promise<string> {
    const filePath = `tmp.txt`;
    return this.writeToFile(input, filePath);
  }

  writeToStorage(
    icalAsString: string,
    options?: WriteToStorageOptions
  ): Promise<string> {
    return this.writeToFile(
      icalAsString,
      `${toFileName(options?.calendarName)}.ical`
    );
  }

  private writeToFile(input: any, filepath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.writeFile(filepath, input, (err) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          fs.readFileSync(filepath);
          resolve(filepath);
        }
      });
    });
  }
}

export interface FileService {
  writeToTmpFile: (input: any) => Promise<string>;
  writeToStorage: (
    icalAsString: string,
    options?: WriteToStorageOptions
  ) => Promise<string>;
}

export interface WriteToStorageOptions {
  calendarName?: string;
}
