import mimeTypes from "mime-types";

import isBinary from "./isBinary.js";

const overrideMimeTypes = {
    "video/x-matroska": "video/webm",
};

export default function contentType(p) {
    const type = mimeTypes.lookup(p);

    if (type) {
        if (overrideMimeTypes[type]) {
            return overrideMimeTypes[type];
        }

        const charset = mimeTypes.charsets.lookup(type);
        return type + (charset ? `; charset=${charset}` : "");
    } else {
        try {
            return isBinary(p) ? "application/octet-stream" : "text/plain";
        } catch {
            return "application/octet-stream";
        }
    }
}
