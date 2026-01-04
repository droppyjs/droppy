/*
export const defaults = {
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
*/

export interface DroppyConfigListener {
    host: string | string[];
    port: number | string | string[];
    protocol: "http" | "https";
    key?: string;
    cert?: string;
    socket?: string;
}
export interface DroppyConfig {
    listeners: DroppyConfigListener[];
    public: boolean;
    timestamps: boolean;
    linkLength: number;
    linkExtensions: boolean;
    logLevel: number;
    maxFileSize: number;
    updateInterval: number;
    pollingInterval: number;
    keepAlive: number;
    uploadTimeout: number;
    allowFrame: boolean;
    readOnly: boolean;
    ignorePatterns: string[];
    watch: boolean;
    headers: Record<string, string>;

    /**
     * hidden option for developer mode
     */
    dev?: boolean;
}
