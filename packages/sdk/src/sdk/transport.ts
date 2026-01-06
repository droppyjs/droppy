export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface DroppyHttpTransport {
    request<T>(req: {
        method: HttpMethod;
        path: string;
        headers?: Record<string, string>;
        body?: any;
    }): Promise<{ status: number; headers: Record<string, string>; data: T }>;
}

export type DroppyWsState = "idle" | "connecting" | "open" | "closed";

export interface DroppyWsTransport {
    connect(opts?: { headers?: Record<string, string> }): Promise<void>;
    close(code?: number, reason?: string): void;

    state(): DroppyWsState;

    send<T>(msg: T): Promise<void>;
    onMessage<T>(cb: (msg: T) => void): () => void;
    onStateChange?(cb: (s: DroppyWsState) => void): () => void;
}

export interface DroppyTransportBundle {
    http: DroppyHttpTransport;
    ws?: DroppyWsTransport;
}
