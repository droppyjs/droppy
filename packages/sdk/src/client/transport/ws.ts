import type { DroppyWsState, DroppyWsTransport } from "../../sdk/transport.js";

export class DroppyClientWsTransport implements DroppyWsTransport {
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
        for (const cb of this.stateListeners) cb(s);
    }

    connect(_opts?: { headers?: Record<string, string> }): Promise<void> {
        if (!this.wsUrl) {
            throw new Error(
                "WebSocket URL is required (call setUrl(wsUrl) or pass it to constructor)",
            );
        }

        if (
            this.ws &&
            (this.ws.readyState === WebSocket.OPEN ||
                this.ws.readyState === WebSocket.CONNECTING)
        ) {
            return Promise.resolve();
        }

        this.setState("connecting");

        return new Promise((resolve, reject) => {
            const ws = new WebSocket(this.wsUrl as string);
            this.ws = ws;

            ws.onopen = () => {
                this.setState("open");
                resolve();
            };

            ws.onclose = () => {
                this.setState("closed");
            };

            ws.onerror = () => {
                // browser doesn't provide useful error details here
                if (this.currentState !== "open") {
                    this.setState("closed");
                    reject(new Error("WebSocket connection failed"));
                }
            };

            ws.onmessage = (evt) => {
                let payload: unknown = evt.data;
                if (typeof payload === "string") {
                    try {
                        payload = JSON.parse(payload);
                    } catch {
                        // keep as string
                    }
                }
                for (const cb of this.messageListeners) {
                    cb(payload);
                }
            };
        });
    }

    close(code?: number, reason?: string): void {
        if (!this.ws) return;
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
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            // try reconnect
            await this.connect();
        }

        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error("WebSocket is not open, and could not reconnected");
        }

        if (typeof msg === "string" || msg instanceof ArrayBuffer) {
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
