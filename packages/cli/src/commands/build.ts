import { resources } from "@droppyjs/server";
import type { Argv, Pkg } from "../types.js";

export async function build(_pkg: Pkg, argv: Argv) {
    console.info("Building resources ...");
    resources.build((err: unknown) => {
        console.info(err || "Resources built successfully");
        process.exit(err ? 1 : 0);
    });

}
