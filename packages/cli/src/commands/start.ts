import { droppy, log } from "@droppyjs/server";
import type { Argv, Pkg } from "../types.js";

export async function start(_pkg: Pkg, argv: Argv) {
    droppy(null, true, argv.dev, (err: unknown) => {
        if (err) {
            log.error(err);
            process.exit(1);
        }
    });
}
