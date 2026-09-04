# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Overview

Monorepo that converts a Shiftworker mobile app database dump into an iCal
file. Two independent npm packages (no workspace tooling — install and run
commands inside each package directory):

- `shiftworker-backend/` — TypeScript Google Cloud Function (`shiftworkerHttp`)
  that accepts an uploaded SQLite dump, converts it to iCal, and stores the
  result in a GCS bucket. Returns the public URL.
- `shiftworker-web/` — Create React App + Chakra UI frontend for
  https://shiftworkerexport.com/, hosted on Netlify.

## Commands

Backend (`cd shiftworker-backend`):

```bash
npm test            # jest (ts-jest), matches **/*.test.ts
npm run build       # tsc — test files are excluded from the build
npm run deploy      # build + gcloud functions deploy (requires gcloud auth)
npx ts-node src/localClient.ts <path-to-db-dump> [calendar-name]   # run locally
```

Frontend (`cd shiftworker-web`):

```bash
npm start           # dev server
npm test            # react-scripts test
npm run build       # production build (what Netlify runs)
```

## Backend architecture

Request flow: `index.ts` (HTTP handler: CORS, rate limiting, body size limit,
structured logging) → `ShiftworkerToIcalService` (writes upload to a tmp file,
always cleans it up) → `core/index.ts` (`exportShiftworkerFileToIcal`).

Inside `src/core/`:

- `shiftworker/db/db.ts` — reads the `shifts` and `shifttypes` tables via
  sqlite3, behind the `ShiftworkerRepository` interface.
- `shiftworker/shiftworkerExportService.ts` — joins shifts with shift types,
  parses times in the user's timezone with dayjs, drops anything before
  yesterday.
- `ical/icalWriter.ts` — renders `VCALENDAR`/`VEVENT` strings.
- `utils/result.ts` — `Result<T, E>` type (`success` / `failure` / `orElseThrow`)
  used instead of throwing for validation.
- `fileService.ts` — `FileService` interface with a `GCloudFileService`
  (GCS + `/tmp`) and a `LocalFileService` implementation.

`core/` is the reusable module; it knows nothing about HTTP or Cloud Functions.
Keep that boundary — new transport concerns belong in `index.ts` or the service
layer.

## Conventions

- TypeScript with `strict: true` in the backend.
- Prettier with default settings (`.prettierrc.json` is `{}`); the frontend
  pins prettier 2.8.8.
- Timezone comes from the client (`?timezone=` query param, resolved via
  `Intl.DateTimeFormat().resolvedOptions().timeZone`) and is validated by
  `ValidTimeZone` — never hardcode a zone.
- The optional `?calendarName=` query param sets `NAME`/`X-WR-CALNAME` in the
  iCal output and the file name part of the generated URL; it is sanitized by
  `sanitizeCalendarName` and defaults to `Shiftworker`.
- Backend logs are single-line JSON with a `severity` and `requestId`; use the
  existing `log()` helper rather than bare `console.log` in the handler.
- Prefer adding unit tests next to the code (`*.test.ts`) for anything in
  `core/`.
