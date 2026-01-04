import fs from "node:fs";
import mv from "mv";

export default function move(src: string, dst: string) {
    return new Promise<void>((resolve, reject) => {
        try {
            fs.statSync(dst);
            reject(new Error("Destination already exists"));
            return;
        } catch (e) {
            if (e instanceof Error && "code" in e && e.code !== "ENOENT") {
                reject(e);
                return;
            }
        }

        mv(src, dst, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
