import crypto from "node:crypto";
import type { DroppyHttpRequest } from "../../types/http.js";

let tokens: string[] = [];

export function create(_req: DroppyHttpRequest) {
    const token = crypto.randomBytes(16).toString("hex");
    tokens.unshift(token);
    tokens = tokens.slice(0, 500);
    return token;
}

export function validate(_req: DroppyHttpRequest, token: string) {
    return tokens.some((storedToken) => {
        return storedToken === token;
    });
}

export default {
    create,
    validate,
};
