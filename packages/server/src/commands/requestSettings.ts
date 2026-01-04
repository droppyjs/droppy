import type { CommandHandler } from "./index.js";

interface RequestSettingsMessage {
    vId: string;
    type: string;
}

export const REQUEST_SETTINGS: CommandHandler<RequestSettingsMessage> = {
    handler: async ({ pkg, sid, sendObj, msg, priv, config, cache }) => {
        sendObj(sid, {
            type: "SETTINGS",
            vId: msg.vId,
            settings: {
                priv,
                version:
                    pkg.tag && pkg.tag !== pkg.version
                        ? `${pkg.version} (${pkg.tag})`
                        : pkg.version,
                dev: config.dev,
                public: config.public,
                readOnly: config.readOnly,
                watch: config.watch,
                engine: `node ${process.version.substring(1)}`,
                platform: process.platform,
                caseSensitive: process.platform === "linux", // TODO: actually test the filesystem
                themes: Object.keys(cache.themes).sort().join("|"),
                modes: Object.keys(cache.modes).sort().join("|"),
            },
        });
    },
};
