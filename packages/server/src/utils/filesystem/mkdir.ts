import fs from "node:fs/promises";

export default async function mkdir(dir: string | string[]) {
    for (const d of Array.isArray(dir) ? dir : [dir]) {
        await fs.mkdir(d, { mode: "755", recursive: true });
    }
}
