import { WebSocket } from "ws";

import type { DroppyWsState, DroppyWsTransport } from "../../sdk/transport.js";

export class DroppyServerWsTransport implements DroppyWsTransport {
    private ws: WebSocket | undefined;
    private wsUrl: string | undefined;
    private currentState: DroppyWsState = "idle";
    private messageListeners = new Set<(msg: unknown) => void>();
    private stateListeners = new Set<(s: DroppyWsState) => void>();

    constructor(wsUrl?: string) {
        this.wsUrl = wsUrl;
    }

    setUrl(wsUrl: string) {
        this.wsUrl = wsUrl;
    }

    private setState(s: DroppyWsState) {
        this.currentState = s;
        for (const cb of this.stateListeners) {
            cb(s);
        }
    }

    async connect(opts?: { headers?: Record<string, string> }): Promise<void> {
        if (!this.wsUrl) {
            throw new Error(
                "WebSocket URL is required (call setUrl(wsUrl) or pass it to constructor)",
            );
        }

        if (this.ws && (this.ws.readyState === 1 || this.ws.readyState === 0)) {
            return;
        }

        this.setState("connecting");

        const url = this.wsUrl;

        await new Promise<void>((resolve, reject) => {
            const ws = new WebSocket(url, {
                headers: opts?.headers,
            });
            this.ws = ws;

            ws.on("open", () => {
                this.setState("open");
                resolve();
            });
            ws.on("close", () => {
                this.setState("closed");
            });
            ws.on("error", (err) => {
                if (this.currentState !== "open") {
                    this.setState("closed");
                    reject(err);
                }
            });
            ws.on("message", (data) => {
                let payload: unknown = data;
                if (typeof payload === "string") {
                    try {
                        payload = JSON.parse(payload);
                    } catch {
                        // keep as string
                    }
                } else {
                    const s = data.toString("utf8");
                    try {
                        payload = JSON.parse(s);
                    } catch {
                        payload = s;
                    }
                }

                for (const cb of this.messageListeners) {
                    cb(payload);
                }
            });
        });
    }

    close(code?: number, reason?: string): void {
        if (!this.ws) {
            return;
        }
        try {
            this.ws.close(code, reason);
        } finally {
            this.ws = undefined;
            this.setState("closed");
        }
    }

    state(): DroppyWsState {
        return this.currentState;
    }

    async send<T>(msg: T) {
        if (!this.ws || this.ws.readyState !== 1) {
            // try reconnect
            await this.connect();
        }

        if (!this.ws || this.ws.readyState !== 1) {
            throw new Error("WebSocket is not open, and could not reconnect");
        }

        if (
            typeof msg === "string" ||
            msg instanceof ArrayBuffer ||
            msg instanceof Uint8Array
        ) {
            this.ws.send(msg);
            return;
        }

        this.ws.send(JSON.stringify(msg));
    }

    onMessage<T>(cb: (msg: T) => void): () => void {
        const handler = cb as unknown as (msg: unknown) => void;
        this.messageListeners.add(handler);
        return () => this.messageListeners.delete(handler);
    }

    onStateChange(cb: (s: DroppyWsState) => void): () => void {
        this.stateListeners.add(cb);
        return () => this.stateListeners.delete(cb);
    }
}
