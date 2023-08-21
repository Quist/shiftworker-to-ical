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
        res.status(500).send("Error");
      });
  } else {
    res.send("Hello World!");
  }
});

async function handlePost(req: Request): Promise<string> {
  const service = new ShiftworkerToIcalService(new GCloudFileService());
  const timezone = extractTimezoneFromUrlQuery(req);
  return await service.convert(req.body, { timezone: timezone });
}

const extractTimezoneFromUrlQuery = (req: Request): string => {
  const timezone = req.query.timezone;
  if (!timezone) {
    throw Error("Timezone not present in url query");
  }
  return <string>timezone;
};
