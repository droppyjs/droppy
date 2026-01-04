import paths from "../../services/paths/index.js";
import normalizePath from "./normalizePath.js";

export default function removeFilesPath(p: string) {
    if (p.length > paths.get().files.length) {
        return normalizePath(p.substring(paths.get().files.length));
    } else if (p === paths.get().files) {
        return "/";
    }
    return p;
}
