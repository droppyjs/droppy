import path from "node:path";
import cd from "content-disposition";

export default function getDispo(fileName: string, download: boolean) {
    return cd(path.basename(fileName), {
        type: download ? "attachment" : "inline",
    });
}
