import type { DroppyHttpRequest } from "../../types/http.js";

export default function port(req: DroppyHttpRequest): number | null {
    const port =
        req.headers?.["x-real-port"]?.toString() ||
        req.socket?.remotePort ||
        req.port || // custom cached property
        (req.remotePort && req.remotePort);

    if (port) {
        if (typeof port === "string") {
            const num = parseInt(port, 10);
            if (Number.isNaN(num)) {
                return null;
            }
            return num;
        }

        return port;
    } else {
        return null;
    }
}
