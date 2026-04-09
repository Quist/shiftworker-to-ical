import fs from "fs";
import crypto from "crypto";
const { Storage } = require("@google-cloud/storage");

export class GCloudFileService implements FileService {
  async writeToStorage(icalAsString: string): Promise<string> {
    const bucketName = process.env.GCS_BUCKET_NAME;
    if (!bucketName) {
      throw new Error("GCS_BUCKET_NAME environment variable is not set");
    }
    const storage = new Storage();
    const id = crypto.randomBytes(16).toString("hex");
    const filePath = `${id}.ical`;
    await storage.bucket(bucketName).file(filePath).save(icalAsString);
    return `https://storage.googleapis.com/${bucketName}/${filePath}`;
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

  writeToStorage(icalAsString: string): Promise<string> {
    return this.writeToFile(icalAsString, "out.tmp");
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
  writeToStorage: (icalAsString: string) => Promise<string>;
}
