import crypto from "node:crypto";

export default function createSid() {
    return crypto.randomBytes(64).toString("base64").substring(0, 48);
}
