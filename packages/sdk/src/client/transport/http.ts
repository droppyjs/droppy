import type { DroppyHttpTransport, HttpMethod } from "../../sdk/transport.js";

export class DroppyClientHttpTransport implements DroppyHttpTransport {
    async request<T>(req: {
        method: HttpMethod;
        path: string;
        headers?: Record<string, string>;
        body?: unknown;
    }): Promise<{ status: number; headers: Record<string, string>; data: T }> {
        const headers = new Headers(req.headers ?? {});
        const init: RequestInit = {
            method: req.method,
            headers,
            credentials: "include",
        };

        if (typeof req.body !== "undefined") {
            if (
                typeof req.body === "string" ||
                req.body instanceof ArrayBuffer ||
                req.body instanceof Blob ||
                req.body instanceof FormData ||
                req.body instanceof URLSearchParams ||
                req.body instanceof ReadableStream
            ) {
                init.body = req.body;
            } else {
                if (!headers.has("content-type")) {
                    headers.set("content-type", "application/json");
                }
                init.body = JSON.stringify(req.body);
            }
        }

        const res = await fetch(req.path, init);
        const outHeaders: Record<string, string> = {};
        res.headers.forEach((value, key) => {
            outHeaders[key] = value;
        });

        const contentType = res.headers.get("content-type") ?? "";
        let data: unknown;
        if (contentType.includes("application/json")) {
            data = await res.json();
        } else {
            data = await res.text();
        }

        return { status: res.status, headers: outHeaders, data: data as T };
    }
}
