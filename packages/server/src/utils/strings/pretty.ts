import util from "node:util";

export default function pretty(data) {
    return util
        .inspect(data, { colors: true })
        .replace(/^\s+/gm, " ")
        .replace(/\s+$/gm, "")
        .replace(/[\r\n]+/gm, "");
}
