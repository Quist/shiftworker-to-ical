import { Request, Response } from "@google-cloud/functions-framework";
import * as fs from "fs";
import * as crypto from "crypto";

import { toICal } from "shiftworker-to-ical";

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
        res.send("Error");
      });
  } else {
    res.send("Hello World!");
  }
});

async function handlePost(req: Request): Promise<string> {
  const filepath = await writeToFile(req.body);
  return await toICal(filepath);
}

function writeToFile(payload: any): Promise<string> {
  const id = crypto.randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    const filePath = `/tmp/${id}.txt`;
    fs.writeFile(filePath, payload, (err) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        fs.readFileSync(filePath);
        resolve(filePath);
      }
    });
  });
}
