import type { DroppyHttpTransport, HttpMethod } from "../../sdk/transport.js";

export class DroppyServerHttpTransport implements DroppyHttpTransport {
    private cookies = new Map<string, string>();

    private applySetCookie(setCookie: string) {
        const firstPart = setCookie.split(";", 1)[0]?.trim();
        if (!firstPart) {
            return;
        }
        const eqIdx = firstPart.indexOf("=");
        if (eqIdx <= 0) {
            return;
        }

        const name = firstPart.slice(0, eqIdx).trim();
        const value = firstPart.slice(eqIdx + 1).trim();

        if (!name) {
            return;
        }

        if (value === "") {
            this.cookies.delete(name);
        } else {
            this.cookies.set(name, value);
        }
    }

    private updateCookiesFromResponse(res: Response) {
        const setCookies = res.headers.getSetCookie();
        if (setCookies && setCookies.length > 0) {
            for (const sc of setCookies) {
                this.applySetCookie(sc);
            }
            return;
        }

        const single = res.headers.get("set-cookie");
        if (single) {
            this.applySetCookie(single);
        }
    }

    private cookieHeaderValue(): string | undefined {
        if (this.cookies.size === 0) return;
        return [...this.cookies.entries()]
            .map(([k, v]) => `${k}=${v}`)
            .join("; ");
    }

    async request<T>(req: {
        method: HttpMethod;
        path: string;
        headers?: Record<string, string>;
        body?: unknown;
    }): Promise<{ status: number; headers: Record<string, string>; data: T }> {
        const headers = new Headers(req.headers ?? {});

        if (!headers.has("cookie")) {
            const cookie = this.cookieHeaderValue();
            if (cookie) {
                headers.set("cookie", cookie);
            }
        }

        const init: RequestInit = {
            method: req.method,
            headers,
        };

        if (typeof req.body !== "undefined") {
            if (
                typeof req.body === "string" ||
                req.body instanceof ArrayBuffer ||
                req.body instanceof Uint8Array ||
                req.body instanceof URLSearchParams
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
        this.updateCookiesFromResponse(res);
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
