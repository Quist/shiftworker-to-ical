import { Request, Response } from "@google-cloud/functions-framework";

const functions = require('@google-cloud/functions-framework');

/**
 * Responds to an HTTP request using data from the request body parsed according
 * to the "content-type" header.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
functions.http('shiftworkerHttp', (req: Request, res: Response) => {
	res.send(`Hello World!`);
});