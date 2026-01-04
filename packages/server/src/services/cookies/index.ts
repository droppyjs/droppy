import { db, utils } from "../../index.js";
import type {
    DroppyHttpRequest,
    DroppyHttpResponse,
} from "../../types/http.js";

// TODO: set secure flag on cookie. Requires X-Forwarded-Proto from the proxy
const cookieParams = ["HttpOnly", "SameSite=strict"];

/**
 * Parses the cookie string into a record of cookie names and values.
 * For example, the cookie string "s=1234567890; path=/" will be parsed into the record { s: "1234567890", path: "/" }.
 * @param cookie
 * @returns A record of cookie names and values.
 */
export function parse(cookie: string) {
    const entries: Record<string, string> = {};
    if (typeof cookie === "string" && cookie.length) {
        cookie.split("; ").forEach((entry) => {
            const parts = entry.trim().split("=");
            entries[parts[0]] = parts[1];
        });
    }
    return entries;
}

/**
 * Gets the session ID from the cookie string, returns null if the cookie is not found or the session ID is not valid.
 * @param cookie
 * @returns The session ID or null if the cookie is not found or the session ID is not valid.
 */
export function get(cookie: string): string | null {
    const entries = parse(cookie);
    if (!entries || !entries.s) {
        return null;
    }

    const sessions = Object.keys(db.get("sessions") || {});
    if (!sessions.includes(entries.s)) {
        return null;
    }

    return entries.s;
}

/**
 * Creates a new cookie for the user.
 * The cookie is created with a new session ID, the path, and the expiration date.
 * The expiration date is set to one year if the user has selected to remember the login.
 * @param _req The request object.
 * @param _req
 * @param res
 * @param _postData
 */
export function free(
    _req: DroppyHttpRequest,
    res: DroppyHttpResponse,
    _postData: Record<string, string>,
) {
    const sessions = db.get("sessions");
    const sid = utils.createSid();
    // TODO: obtain path
    res.setHeader("Set-Cookie", cookieHeaders(sid, "/", inOneYear()));
    sessions[sid] = {
        privileged: true,
        lastSeen: Date.now(),
    };
    db.set("sessions", sessions);
}

/**
 * Creates a new cookie for the user.
 * The cookie is created with the session ID, the path, and the expiration date.
 * The expiration date is set to one year if the user has selected to remember the login.
 * @param req The request object.
 * @param res The response object.
 * @param postData The post data object.
 */
export function create(
    _req: DroppyHttpRequest,
    res: DroppyHttpResponse,
    postData: Record<string, string>,
) {
    const sessions = db.get("sessions");
    const sid = utils.createSid();
    const expires = postData.remember ? inOneYear() : null;
    res.setHeader("Set-Cookie", cookieHeaders(sid, postData.path, expires));
    sessions[sid] = {
        privileged: db.get("users")[postData.username].privileged,
        username: postData.username,
        lastSeen: Date.now(),
    };
    db.set("sessions", sessions);
}

export function unset(
    req: DroppyHttpRequest,
    res: DroppyHttpResponse,
    postData: Record<string, string>,
) {
    if (!req.headers.cookie) {
        return;
    }

    const session = parse(req.headers.cookie).s;
    if (!session) {
        return;
    }

    const sessions = db.get("sessions");
    delete sessions[session];
    db.set("sessions", sessions);
    res.setHeader("Set-Cookie", cookieHeaders("gone", postData.path, epoch()));
}

function inOneYear() {
    return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
}

function epoch() {
    return new Date(0).toUTCString();
}

function cookieHeaders(
    sid: string,
    path: string | undefined,
    expires?: string | null,
) {
    const realCookie: Record<string, string> = { s: sid, path: path || "/" };
    const deleteCookie = { s: "gone", expires: epoch(), path: "/" };
    if (path === "/" || !path) {
        if (expires) {
            realCookie.expires = inOneYear();
        }
        return cookieString(realCookie);
    } else {
        // expire a possible invalid old cookie on the / path
        if (expires) {
            realCookie.expires = inOneYear();
        }
        return [cookieString(deleteCookie), cookieString(realCookie)];
    }
}

function cookieString(params: Record<string, string>) {
    return Object.keys(params)
        .map((param) => {
            return `${param}=${params[param]}`;
        })
        .concat(cookieParams)
        .join("; ");
}

export default {
    parse,
    get,
    free,
    create,
    unset,
};
