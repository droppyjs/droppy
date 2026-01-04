import type fs from "node:fs";
import { access, stat } from "node:fs/promises";
import path from "node:path";

export default async function getNewPath(
    origPath: string,
    callback: (path: string) => void,
) {
    let stats: fs.Stats;
    try {
        stats = await stat(origPath);
    } catch {
        return callback(origPath);
    }

    let filename = path.basename(origPath);
    const dirname = path.dirname(origPath);
    let extension = "";

    if (filename.includes(".") && stats.isFile()) {
        extension = filename.substring(filename.lastIndexOf("."));
        filename = filename.substring(0, filename.lastIndexOf("."));
    }

    if (!/-\d+$/.test(filename)) {
        filename += "-1";
    }

    let canCreate = false;
    while (!canCreate) {
        const num = parseInt(
            filename.substring(filename.lastIndexOf("-") + 1),
            10,
        );
        filename =
            filename.substring(0, filename.lastIndexOf("-") + 1) + (num + 1);
        try {
            await access(path.join(dirname, filename + extension));
        } catch {
            canCreate = true;
        }
    }

    callback(path.join(dirname, filename + extension));
}
