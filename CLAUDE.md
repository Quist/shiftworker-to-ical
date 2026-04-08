# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Does

Converts Shiftworker mobile app SQLite database exports to iCal format, enabling import into Google Calendar. Three integration points: a reusable **core** library/CLI, a **React web UI**, and a **Google Cloud Functions backend**.

## Structure

```
shiftworker-backend/     # Google Cloud Function (HTTP trigger) — contains all conversion logic
shiftworker-web/         # React frontend (deployed to Netlify)
```

## Commands

### Backend
```bash
cd shiftworker-backend
npm run build         # Compile TypeScript
npm test              # Run Jest tests
npm run deploy        # Build + deploy to Google Cloud Functions (Node 20)
npx jest --testPathPattern="<test-file-name>"  # Run a single test
```

### Web
```bash
cd shiftworker-web
npm start             # Start React dev server
npm run build         # Production build
npm run deploy        # Push to main (Netlify auto-deploys)
```

## Architecture & Data Flow

**Web request flow:**
1. User uploads `.sqlite` file at `shiftworkerexport.com`
2. `shiftworker-web/src/api.ts` `postToBackend()` sends binary + timezone/prefix as query params to the Cloud Function
3. Cloud Function (`shiftworker-backend/src/shiftworkerToIcalService.ts`) writes temp file, calls `exportShiftworkerFileToIcal()`
4. Core reads SQLite, converts to iCal, returns the content
5. Backend uploads to Google Cloud Storage, returns download URL
6. Web redirects to the download URL

**Conversion pipeline** (`shiftworker-backend/src/`):
- `shiftworker/db/db.ts` — `ShiftworkerDbRepository` reads `shifts` + `shifttype` tables from SQLite
- `shiftworker/shiftworkerExportService.ts` — maps DB rows to `Shift` objects, applies timezone, filters past shifts
- `ical/icalWriter.ts` — converts `Shift[]` to iCal VEVENT blocks
- `exportShiftworkerFileToIcal.ts` — orchestrates the pipeline

## Key Patterns

- **Result type** (`core/src/result.ts`): `Result<T, E>` used throughout instead of thrown exceptions — always check `isSuccess` before accessing `.value`.
- **ValidTimeZone** (`core/src/ical/icalWriter.ts`): value object that validates timezones on construction; construct via `ValidTimeZone.create()` which returns a `Result`.
- **Timezone handling**: Shift dates are stored as date-only strings in SQLite; times come from `shifttype` definitions. The user's timezone is applied during export using dayjs with timezone plugin (`core/src/dateUtil.ts`).
- **FileService interface** (`shiftworker-backend/`): allows swapping GCloud Storage for local file system in tests.

## Deployment Targets

- **Backend**: Google Cloud Function at `https://us-central1-shiftworker-387320.cloudfunctions.net/shiftworkerHttp`
- **Web**: Netlify at `https://shiftworkerexport.com/` (auto-deploys on push to main)
- **Core**: Published to NPM as `shiftworker-to-ical`
