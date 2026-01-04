import type { Command } from "../types.js";
import { add } from "./add.js";
import { build } from "./build.js";
import { config } from "./config.js";
import { del } from "./del.js";
import { help } from "./help.js";
import { list } from "./list.js";
import { start } from "./start.js";
import { stop } from "./stop.js";
import { version } from "./version.js";

export const commands: Record<string, Command> = {
    start: {
        description: "Start the server",
        execute: start,
    },
    stop: {
        description: "Stop the server",
        execute: stop,
    },
    config: {
        description: "Edit the config",
        execute: config,
    },
    list: {
        description: "List users",
        execute: list,
    },
    add: {
        description: "Add a user",
        args: ["<user>", "<pass>", "[p]"],
        execute: add,
    },
    del: {
        description: "Delete a user",
        args: ["<user>"],
        execute: del,
    },
    build: {
        description: "Build client resources",
        execute: build,
    },
    version: {
        description: "Print version",
        execute: version,
    },
    help: {
        description: "Print help",
        execute: help,
    },
};

export const opts: Record<string, string> = {
    configdir:
        "-c, --configdir <dir>  Config directory. Default: ~/.droppy/config",
    filesdir:
        "-f, --filesdir <dir>   Files directory. Default: ~/.droppy/files",
    daemon: "-d, --daemon           Daemonize (background) process",
    log: "-l, --log <file>       Log to file instead of stdout",
    dev: "--dev                  Enable developing mode",
    color: "--color                Force-enable colored log output",
    nocolor: "--no-color             Force-disable colored log output",
};
