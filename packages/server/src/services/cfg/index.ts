import fs from "node:fs/promises";
import { dirname } from "node:path";

import { log, paths } from "../../index.js";
import { defaults } from "./defaults.js";
import type { DroppyConfig } from "./types.js";

const hiddenOpts = ["dev"];

export async function init(config: DroppyConfig | null = null) {
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
                config = Object.assign({}, defaults);
            }

            // TODO: validate more options
            if (typeof config.pollingInterval !== "number") {
                throw new TypeError(
                    "Expected a number for the 'pollingInterval' option",
                );
            }

            // Remove options no longer present
            Object.keys(config).forEach((key) => {
                if (defaults[key] === undefined && !hiddenOpts.includes(key)) {
                    delete config?.[key];
                }
            });
            await write(configFile, config);
            return config;
        } catch (err) {
            log.error("Error reading config file", err);
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
