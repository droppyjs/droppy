import fs from "node:fs/promises";
import { dirname } from "node:path";

import { paths } from "../index.js";

const defaults = {
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

const hiddenOpts = ["dev"];

export async function init(config) {
    const configFile = paths.get().cfgFile;

    if (typeof config === "object" && config !== null) {
        config = Object.assign({}, defaults, config);
        return config;
    } else {
        try {
            await fs.stat(configFile);
        } catch (err) {
            if (
                err instanceof Error &&
                "code" in err &&
                err.code === "ENOENT"
            ) {
                config = defaults;
                await fs.mkdir(dirname(configFile), { recursive: true });

                await write(configFile, config);
                return config;
            } else {
                throw err;
            }
        }

        try {
            const data = await fs.readFile(configFile);
            if (data) {
                config = JSON.parse(String(data));
            }
            if (!config) {
                config = {};
            }

            config = Object.assign({}, defaults, config);

            // TODO: validate more options
            if (typeof config.pollingInterval !== "number") {
                throw new TypeError(
                    "Expected a number for the 'pollingInterval' option",
                );
            }

            // Remove options no longer present
            Object.keys(config).forEach((key) => {
                if (defaults[key] === undefined && !hiddenOpts.includes(key)) {
                    delete config[key];
                }
            });
            await write(configFile, config);
            return config;
        } catch (err) {
            console.error(err);
            // TODO: can we print helpful information here?
            throw err;
        }
    }
}

export async function write(configFile, config) {
    await fs.writeFile(configFile, JSON.stringify(config, null, 2));
}

export default {
    init,
    write,
};