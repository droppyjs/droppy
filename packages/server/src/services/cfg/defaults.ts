import type { DroppyConfig } from "./types.js";

export const defaults: DroppyConfig = {
    listeners: [
        {
            host: ["0.0.0.0", "::"],
            port: 8989,
            protocol: "http",
        },
    ],
    public: false,
    timestamps: true,
    linkLength: 5,
    linkExtensions: false,
    logLevel: 2,
    maxFileSize: 0,
    updateInterval: 1000,
    pollingInterval: 0,
    keepAlive: 20000,
    uploadTimeout: 604800000,
    allowFrame: false,
    readOnly: false,
    ignorePatterns: [],
    watch: true,
    headers: {},
};
