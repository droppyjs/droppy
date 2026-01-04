import path from "node:path";
import paths from "../../services/paths/index.js";

export default function addFilesPath(p: string) {
    const filesPath = path.resolve(
        p === "/" ? paths.get().files : path.join(`${paths.get().files}/${p}`),
    );

    if (!filesPath.startsWith(path.resolve(paths.get().files))) {
        return paths.get().files;
    }

    return filesPath;
}
