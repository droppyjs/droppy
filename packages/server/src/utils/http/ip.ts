import type { DroppyHttpRequest } from "../../types/http.js";

export default function ip(req: DroppyHttpRequest): string | null {
    // TODO: https://tools.ietf.org/html/rfc7239

    return (
        req.headers?.["x-forwarded-for"]?.toString().split(",")[0].trim() ||
        req.headers?.["x-real-ip"]?.toString() ||
        req.socket?.remoteAddress ||
        req.addr || // custom cached property
        (req.remoteAddress && req.remoteAddress) ||
        null
    );
}
