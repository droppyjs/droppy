import type { DroppyConfig } from "../services/cfg/types.js";
import type { DroppyWebSocket } from "../types/http.js";

export type HandlerArgs<T> = {
    priv: boolean;
    msg: T;
    sendObj: (sid: string, data: any) => void;
    sid: string;
    updateClientLocation: (dir: any, sid: any, vId: any) => void;
    sendFiles: (sid: string, vId: any) => void;
    sendError: (sid: string, vId: any, text: string) => void;
    validatePaths: (
        paths: any,
        type: any,
        ws: any,
        sid: any,
        vId: any,
    ) => boolean;
    sendUsers: (sid: string) => Promise<void>;
    pkg: {
        name: string;
        version: string;
        tag?: string;
    };
    config: DroppyConfig;
    cache: any;
    ws: DroppyWebSocket;
    setView: (sid: any, vId: any, view: any) => void;
    vId: string;
    cookie: string;
};

export type CommandHandler<T = any> = (args: HandlerArgs<T>) => Promise<void>;

export const createCommand = <T>(
    name: string,
    handler: (args: HandlerArgs<T>) => Promise<void>,
) => {
    return {
        name,
        handler,
    };
};
