// @ts-nocheck
import crypto from "node:crypto";

let tokens = [];

export function create(req) {
    const token = crypto.randomBytes(16).toString("hex");
    tokens.unshift(token);
    tokens = tokens.slice(0, 500);
    return token;
}

export function validate(token) {
    return tokens.some((storedToken) => {
        return storedToken === token;
    });
}

export default {
    create,
    validate,
};
