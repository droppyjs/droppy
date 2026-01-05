import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const commandList: Record<string, CommandHandler> = {};

export const getCommand = (name: string) => {
    return commandList[name];
};

export const reloadCommands = async () => {
    const thisFileDir = path.dirname(fileURLToPath(import.meta.url));
    const commandFiles = await fs.readdir(thisFileDir);
    const commandModules = commandFiles.filter(
        (file) => file.endsWith(".js") && file !== "index.js",
    );

    for (const file of commandModules) {
        const module = await import(
            pathToFileURL(path.join(thisFileDir, file)).href
        );
        if ("name" in module.default && "handler" in module.default) {
            if (commandList[module.default.name]) {
                log.error(
                    null,
                    `Command ${module.default.name} already loaded, skipped ${file}`,
                );
                continue;
            }
            commandList[module.default.name] = module.default.handler;
        } else {
            log.error(null, `Invalid command module skipped ${file}`);
        }
    }
};

import type { CommandHandler } from "../command/index.js";
import log from "../services/log/index.js";
