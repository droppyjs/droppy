import type { DroppyHttpRequest } from "../../types/http.js";

export default function readJsonBody<TBody extends object = object>(
    req: DroppyHttpRequest,
): Promise<TBody> {
    return new Promise((resolve, reject) => {
        try {
            if (req.body) {
                // This is needed if the express application is using body-parser
                if (typeof req.body === "object") {
                    resolve(req.body as TBody);
                } else {
                    resolve(JSON.parse(req.body));
                }
            } else {
                const collectedChunks: Buffer[] = [];
                req.on("data", (chunk) => {
                    collectedChunks.push(chunk);
                }).on("end", () => {
                    const body = String(Buffer.concat(collectedChunks));
                    resolve(JSON.parse(body));
                });
            }
        } catch (err) {
            reject(err);
        }
    });
}
