import type http from "node:http";

/**
 * droppy extends Node's request/response objects with a few optional fields.
 * Keep those extensions local to droppy code instead of globally augmenting `node:http`.
 */
export interface DroppyHttpRequest<TBody = unknown> extends http.IncomingMessage {
    /**
     * May be added by middleware/frameworks (e.g. body parsing) or by droppy.
     */
    body?: TBody;

    /**
     * Custom cached properties used by droppy in a few places.
     */
    addr?: string;
    port?: string | number;

    /**
     * Timestamp captured at request start (used for logging latency).
     */
    time?: number;

    /**
     * Optional convenience aliases sometimes provided by upstream proxies/frameworks.
     */
    remoteAddress?: string;
    remotePort?: number;
}

export type DroppyHttpResponse = http.ServerResponse;


