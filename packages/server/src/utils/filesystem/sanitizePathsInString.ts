import escapeStringRegexp from "escape-string-regexp";
import paths from "../../services/paths/index.js";

export default function sanitizePathsInString(str: string) {
    return (str || "").replace(
        new RegExp(escapeStringRegexp(paths.get().files), "g"),
        "",
    );
}
