# shiftworker-backend

Google Cloud Function (`shiftworkerHttp`) that converts an uploaded Shiftworker
database dump into an iCal file, stores it in Google Cloud Storage and returns
the public URL to the frontend.

## Development

```bash
npm install
npm test                                           # jest
npm run build                                      # tsc
npx ts-node src/localClient.ts <path-to-db-dump> [calendar-name]   # convert a dump locally
```

The local client writes its scratch file (`tmp.txt`) and the generated calendar
(`<calendar-name>.ical`, defaults to `shiftworker.ical`) to the working
directory; both are git-ignored.

## Query parameters

| Parameter      | Required | Description                                                                 |
| -------------- | -------- | --------------------------------------------------------------------------- |
| `timezone`     | yes      | IANA timezone the shift times are interpreted in, e.g. `Europe/Oslo`.        |
| `calendarName` | no       | Name calendar apps show for the calendar. Defaults to `Shiftworker`.         |

## Deploy

```bash
npm run deploy    # tsc + gcloud functions deploy (requires gcloud auth)
```

See the [Cloud Functions HTTP docs](https://cloud.google.com/functions/docs/create-deploy-http-nodejs)
for details on the runtime.
