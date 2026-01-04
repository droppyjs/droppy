import fs from "node:fs";

export default function copyFile(src: string, dst: string) {
    return new Promise<void>((resolve, reject) => {
        let isDoneCalled = false;
        const read = fs.createReadStream(src);
        const write = fs.createWriteStream(dst);

        function done(err?: Error) {
            if (isDoneCalled) {
                return;
            }
            isDoneCalled = true;

            if (err) {
                reject(err);
                return;
            }
            resolve();
        }

        read.on("error", done);
        write.on("error", done);
        write.on("close", done);

        read.pipe(write);
    });
}
