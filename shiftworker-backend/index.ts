import { Request, Response } from "@google-cloud/functions-framework";
import { randomUUID } from "crypto";
import { ShiftworkerToIcalService } from "./src/shiftworkerToIcalService";
import { GCloudFileService } from "./src/fileService";

const functions = require("@google-cloud/functions-framework");

const MAX_BODY_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// Simple in-memory rate limiter: max 10 requests per IP per minute.
// Note: resets per function instance — use Cloud Armor for stricter enforcement.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

function log(severity: "INFO" | "WARNING" | "ERROR", data: object) {
  console.log(JSON.stringify({ severity, ...data }));
}

functions.http("shiftworkerHttp", (req: Request, res: Response) => {
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.send("Hello World!");
    return;
  }

  const requestId = randomUUID();
  const startedAt = Date.now();
  const ip = req.ip ?? "unknown";

  log("INFO", { requestId, event: "request_received", ip });

  if (isRateLimited(ip)) {
    log("WARNING", { requestId, event: "rate_limited", ip });
    res.status(429).json({ error: "RATE_LIMITED", message: "Too many requests. Please try again later.", requestId });
    return;
  }

  handlePost(req)
    .then((outfile) => {
      log("INFO", {
        requestId,
        event: "request_completed",
        durationMs: Date.now() - startedAt,
        outfile,
      });
      res.send(outfile);
    })
    .catch((e) => {
      if (e instanceof FileTooLargeError) {
        log("WARNING", { requestId, event: "file_too_large", bytes: Buffer.byteLength(req.body) });
        res.status(413).json({ error: "FILE_TOO_LARGE", message: "File too large. Maximum size is 10 MB.", requestId });
      } else if (e instanceof TimezoneError) {
        log("WARNING", { requestId, event: "invalid_timezone", message: e.message });
        res.status(400).json({ error: "INVALID_TIMEZONE", message: e.message, requestId });
      } else {
        log("ERROR", { requestId, event: "internal_error", message: String(e), durationMs: Date.now() - startedAt });
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Something went wrong. Please try again.", requestId });
      }
    });
});

async function handlePost(req: Request): Promise<string> {
  const bodySize = Buffer.byteLength(req.body);
  if (bodySize > MAX_BODY_SIZE_BYTES) {
    throw new FileTooLargeError(bodySize);
  }
  const service = new ShiftworkerToIcalService(new GCloudFileService());
  const timezone = extractTimezoneFromUrlQuery(req);
  return await service.convert(req.body, { timezone });
}

class FileTooLargeError extends Error {
  constructor(bytes: number) {
    super(`File too large: ${bytes} bytes (max ${MAX_BODY_SIZE_BYTES})`);
  }
}

class TimezoneError extends Error {
  constructor(message: string) {
    super(message);
  }
}

const extractTimezoneFromUrlQuery = (req: Request): string => {
  const timezone = req.query.timezone;
  if (!timezone) {
    throw new TimezoneError("Missing required query parameter: timezone");
  }
  return <string>timezone;
};
