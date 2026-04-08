import { Request, Response } from "@google-cloud/functions-framework";
import { ShiftworkerToIcalService } from "./src/shiftworkerToIcalService";
import { GCloudFileService } from "./src/fileService";

const functions = require("@google-cloud/functions-framework");

/**
 * Responds to an HTTP request using data from the request body parsed according
 * to the "content-type" header.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
functions.http("shiftworkerHttp", (req: Request, res: Response) => {
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    // Send response to OPTIONS requests
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
  } else if (req.method === "POST") {
    handlePost(req)
      .then((response) => {
        res.send(response);
      })
      .catch((e) => {
        console.error(e);
        if (e instanceof FileTooLargeError) {
          res.status(413).send("File too large. Maximum size is 10 MB.");
        } else {
          res.status(500).send("Error");
        }
      });
  } else {
    res.send("Hello World!");
  }
});

const MAX_BODY_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

async function handlePost(req: Request): Promise<string> {
  const bodySize = Buffer.byteLength(req.body);
  if (bodySize > MAX_BODY_SIZE_BYTES) {
    throw new FileTooLargeError(bodySize);
  }
  const service = new ShiftworkerToIcalService(new GCloudFileService());
  const timezone = extractTimezoneFromUrlQuery(req);
  return await service.convert(req.body, { timezone: timezone });
}

class FileTooLargeError extends Error {
  constructor(bytes: number) {
    super(`File too large: ${bytes} bytes (max ${MAX_BODY_SIZE_BYTES})`);
  }
}

const extractTimezoneFromUrlQuery = (req: Request): string => {
  const timezone = req.query.timezone;
  if (!timezone) {
    throw Error("Timezone not present in url query");
  }
  return <string>timezone;
};
