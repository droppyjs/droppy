import fs from "node:fs";

export default function copyFile(src: string, dst: string, cb) {
    let cbCalled = false;
    const read = fs.createReadStream(src);
    const write = fs.createWriteStream(dst);

    function done(err?: Error) {
        if (cbCalled) {
            return;
        }
        cbCalled = true;
        if (cb) {
            cb(err);
        }
    }

    read.on("error", done);
    write.on("error", done);
    write.on("close", done);
    read.pipe(write);
}
