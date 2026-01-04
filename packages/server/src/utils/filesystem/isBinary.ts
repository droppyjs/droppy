import path from "node:path";

import { isBinary as isTextOrBinary } from "istextorbinary";

const forceBinaryTypes = ["pdf", "ps", "eps", "ai"];

export default function isBinary(p: string) {
    if (forceBinaryTypes.includes(path.extname(p).substring(1))) {
        return true;
    }

    return isTextOrBinary(p);
}
