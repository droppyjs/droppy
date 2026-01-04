import fs from "node:fs";

export default function readFile(p, cb) {
    if (typeof p !== "string") {
        return cb(null);
    }

    fs.stat(p, (_, stats) => {
        if (stats?.isFile()) {
            fs.readFile(p, (err, data) => {
                if (err) {
                    return cb(err);
                }
                cb(null, String(data));
            });
        } else {
            cb(null);
        }
    });
}
