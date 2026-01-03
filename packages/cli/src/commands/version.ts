import type { Argv, Pkg } from "../types.js";

export async function version(pkg: Pkg, _argv: Argv) {
    console.info(pkg.version);
}
