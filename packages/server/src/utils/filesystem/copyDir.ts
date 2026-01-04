import { copyFile, lstat, mkdir, readdir } from "node:fs/promises";
import path from "node:path";

export default async function copyDir(src: string, dest: string) {
    await mkdir(dest);

    for (const file of await readdir(src)) {
        if ((await lstat(path.join(src, file))).isFile()) {
            await copyFile(path.join(src, file), path.join(dest, file));
        } else {
            await copyDir(path.join(src, file), path.join(dest, file));
        }
    }
}
