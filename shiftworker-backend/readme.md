# shiftworker-backend

Google Cloud Function (`shiftworkerHttp`) that converts an uploaded Shiftworker
database dump into an iCal file, stores it in Google Cloud Storage and returns
the public URL to the frontend.

## Development

```bash
npm install
npm test                                           # jest
npm run build                                      # tsc
npx ts-node src/localClient.ts <path-to-db-dump>    # convert a dump locally
```

The local client writes its scratch and output files (`tmp.txt`, `out.tmp`) to
the working directory; both are git-ignored.

## Deploy

```bash
npm run deploy    # tsc + gcloud functions deploy (requires gcloud auth)
```

See the [Cloud Functions HTTP docs](https://cloud.google.com/functions/docs/create-deploy-http-nodejs)
for details on the runtime.
