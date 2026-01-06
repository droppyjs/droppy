import { DroppySDK } from "../sdk/sdk.js";
import { DroppyServerHttpTransport } from "./transport/http.js";
import { DroppyServerWsTransport } from "./transport/ws.js";

export class DroppyServerSDK extends DroppySDK {
    getRootPath() {
        return "/";
    }

    _onConstruct(): void {
        if (!this.hostname) {
            throw new Error("Hostname is required for server-side SDK");
        }
        this.verifyHostname();
    }

    _getTransport() {
        return {
            http: new DroppyServerHttpTransport(),
            ws: new DroppyServerWsTransport(),
        };
    }
}

export * from "../sdk/index.js";
export * from "./transport/http.js";
export * from "./transport/ws.js";
