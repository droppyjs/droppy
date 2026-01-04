import escapeStringRegexp from "escape-string-regexp";

export default function extensionRe(arr: string[]) {
    const result = arr.map((ext) => {
        return escapeStringRegexp(ext);
    });
    return new RegExp(`\\.(${result.join("|")})$`, "i");
}
