import { DroppySDK } from "../sdk/sdk.js";
import { DroppyClientHttpTransport } from "./transport/http.js";
import { DroppyClientWsTransport } from "./transport/ws.js";

export class DroppyClientSDK extends DroppySDK {
    getRootPath() {
        const p = window.location.pathname;
        if (p[p.length - 1]) {
            return p;
        } else {
            return `${p}/`;
        }
    }

    _onConstruct(): void {
        if (!this.hostname) {
            this.hostname = window.location.origin;
        }
        this.verifyHostname();
    }

    _getTransport() {
        return {
            http: new DroppyClientHttpTransport(),
            ws: new DroppyClientWsTransport(),
        };
    }
}

export * from "../sdk/index.js";
export * from "./transport/http.js";
export * from "./transport/ws.js";
