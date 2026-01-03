import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as util from "node:util";
import { log, paths } from "@droppyjs/server";
import { daemonizeProcess } from "daemonize-process";
import minimist from "minimist";
import untildify from "untildify";
import pkg from "../package.json" with { type: "json" };
import type { Argv } from "./types.js";
import { help } from "./commands/help.js";
import { commands } from "./commands/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

util.inspect.defaultOptions.depth = 4;

const argv = minimist(process.argv.slice(2), {
    boolean: ["color", "d", "daemon", "dev"],
}) as Argv;

if (!argv.dev) {
    process.env.NODE_ENV = "production";
}

process.title = pkg.name;
process.chdir(__dirname);

if (argv.v || argv.V || argv.version) {
    console.info(pkg.version);
    process.exit(0);
}

if (argv.daemon || argv.d) {
    daemonizeProcess();
}

if (argv.configdir || argv.filesdir || argv.c || argv.f) {
    paths.seed(argv.configdir || argv.c, argv.filesdir || argv.f);
}

const logPath = argv.log ?? argv.l;
if (logPath) {
    try {
        log.setLogFile(
            fs.openSync(untildify(path.resolve(logPath)), "a", 0o644),
        );
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`Unable to open log file for writing: ${message}`);
        process.exit(1);
    }
}

if (!argv._.length) {
    help(pkg, argv);
    process.exit(0);
}

const cmd = argv._[0];
if (!cmd) {
    help(pkg, argv);
    process.exit(0);
}

if (commands[cmd]) {
    commands[cmd].execute(pkg, argv);
} else {
    console.error(`Unknown command: ${cmd}`);
    help(pkg, argv);
}
