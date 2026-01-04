import crypto from "node:crypto";
import type { DroppyHttpRequest } from "../../types/http.js";
import cookies from "../cookies/index.js";
import {
    CSRF_CLEANUP_INTERVAL_MS,
    CSRF_MAX_KEYS,
    CSRF_MAX_TOKENS_PER_KEY,
    CSRF_TOKEN_TTL_MS,
} from "./config.js";
import type { TokenEntry } from "./types.js";

const tokensByKey = new Map<string, TokenEntry>();
let lastCleanup = 0;

function keyFromReq(req: DroppyHttpRequest): string | null {
    const cookie = req.headers.cookie;
    if (cookie) {
        const sid = cookies.get(cookie);
        if (sid) {
            return `sid:${sid}`;
        }
    }
    return null;
}

function cleanupIfNeeded() {
    const now = Date.now();
    if (now - lastCleanup < CSRF_CLEANUP_INTERVAL_MS) {
        return;
    }
    lastCleanup = now;

    for (const [key, entry] of tokensByKey) {
        for (const [token, createdAt] of entry.tokens) {
            if (now - createdAt > CSRF_TOKEN_TTL_MS) {
                entry.tokens.delete(token);
            }
        }

        if (
            entry.tokens.size === 0 &&
            now - entry.lastSeen > CSRF_TOKEN_TTL_MS
        ) {
            tokensByKey.delete(key);
        }
    }

    // hard cap on tokens
    if (tokensByKey.size > CSRF_MAX_KEYS) {
        const keysByOldest = [...tokensByKey.entries()].sort(
            (a, b) => a[1].lastSeen - b[1].lastSeen,
        );
        for (const [key] of keysByOldest.slice(
            0,
            tokensByKey.size - CSRF_MAX_KEYS,
        )) {
            tokensByKey.delete(key);
        }
    }
}

export function create(req: DroppyHttpRequest) {
    cleanupIfNeeded();
    const key = keyFromReq(req);
    if (!key) {
        return "";
    }
    const token = crypto.randomBytes(16).toString("hex");

    const now = Date.now();
    let entry = tokensByKey.get(key);
    if (!entry) {
        entry = { tokens: new Map(), lastSeen: now };
        tokensByKey.set(key, entry);
    }

    entry.tokens.set(token, now);
    entry.lastSeen = now;

    // Bound memory per key by evicting oldest tokens.
    while (entry.tokens.size > CSRF_MAX_TOKENS_PER_KEY) {
        let oldestToken: string | undefined;
        let oldestTime = Infinity;
        for (const [t, createdAt] of entry.tokens) {
            if (createdAt < oldestTime) {
                oldestTime = createdAt;
                oldestToken = t;
            }
        }
        if (!oldestToken) break;
        entry.tokens.delete(oldestToken);
    }

    return token;
}

export function validate(req: DroppyHttpRequest, token: string) {
    cleanupIfNeeded();
    const key = keyFromReq(req);
    if (!key) {
        return false;
    }
    const entry = tokensByKey.get(key);
    if (!entry) {
        return false;
    }

    const createdAt = entry.tokens.get(token);
    if (!createdAt) {
        return false;
    }

    if (Date.now() - createdAt > CSRF_TOKEN_TTL_MS) {
        entry.tokens.delete(token);
        return false;
    }

    entry.lastSeen = Date.now();
    return true;
}

export default {
    create,
    validate,
};
