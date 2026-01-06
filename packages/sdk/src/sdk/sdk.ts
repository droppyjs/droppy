import { DroppyHttpError } from "./errors/http-error.js";
import type { DroppyTransportBundle } from "./transport.js";

export abstract class DroppySDK {
    private _transport: DroppyTransportBundle;

    constructor(public hostname?: string) {
        this._onConstruct();
        this._transport = this._getTransport();
    }

    protected resolveUrl(path: string): string {
        // allow callers to pass an absolute URL
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }

        this.verifyHostname();

        let rootPath = this.getRootPath?.() ?? "/";
        if (!rootPath.startsWith("/")) {
            rootPath = `/${rootPath}`;
        }
        if (!rootPath.endsWith("/")) {
            rootPath = `${rootPath}/`;
        }

        // If the caller passes `/foo`, treat it as relative to rootPath, not absolute to origin.
        const relPath = path.startsWith("/") ? path.slice(1) : path;

        const base = new URL(this.hostname as string);
        base.pathname = rootPath;
        return new URL(relPath, base).toString();
    }

    // --------------------------------------------------
    //  User management
    // --------------------------------------------------

    /**
     * Create the first user on the server
     * @param username
     * @param password
     * @throws DroppyHttpError if the request fails
     */
    async createFirstUser(username: string, password: string) {
        const res = await this.getTransport().http.request({
            method: "POST",

            path: this.resolveUrl("!/adduser"),
            body: {
                username,
                password,
                path: this.getRootPath(),
            },
        });

        if (res.status !== 200) {
            throw new DroppyHttpError(res.status, "Failed to add user");
        }
    }

    async login(username: string, password: string, remember: boolean) {
        try {
            const res = await this.getTransport().http.request({
                method: "POST",
                path: this.resolveUrl("!/login"),
                body: {
                    username,
                    password,
                    remember,
                    path: this.getRootPath(),
                },
            });

            if (res.status !== 200) {
                return false;
            }
        } catch {
            return false;
        }

        return true;
    }

    async logout() {
        try {
            const res = await this.getTransport().http.request({
                method: "POST",
                path: this.resolveUrl("!/logout"),
                body: {
                    path: this.getRootPath(),
                },
            });

            if (res.status !== 200) {
                return false;
            }
        } catch {
            return false;
        }

        return true;
    }

    verifyHostname(): void {
        if (!this.hostname) {
            throw new Error("Hostname is required");
        }
        if (!this.hostname.startsWith("http")) {
            throw new Error(
                "Hostname must start with http or https, for example: 'http://127.0.0.1:8989', 'https://droppy.example.org'",
            );
        }
    }

    abstract getRootPath(): string;

    // --------------------------------------------------
    //  Transport
    // --------------------------------------------------

    /**
     * Do not call this method directly. Use getTransport() instead.
     * @returns A new instance of the transport bundle.
     */
    abstract _getTransport(): DroppyTransportBundle;

    /**
     * Get the transport bundle.
     * @returns The transport bundle.
     */
    public getTransport(): DroppyTransportBundle {
        if (!this._transport) {
            this._transport = this._getTransport();
        }
        return this._transport;
    }

    // --------------------------------------------------
    //  Internal methods
    // --------------------------------------------------

    abstract _onConstruct(): void;
}
