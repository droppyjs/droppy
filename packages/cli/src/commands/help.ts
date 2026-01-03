import type { Argv, Pkg } from "../types.js";
import { commands, opts } from "./index.js";

export async function help(pkg: Pkg, _argv: Argv) {
    let help = `Usage: ${pkg.name} command [options]\n\n Commands:`;

    const commandNames = Object.keys(commands);
    const commandUsages = commandNames.map((name) => {
        const args = commands[name].args?.join(" ");
        return args ? `${name} ${args}` : name;
    });
    const maxCommandUsageLen = commandUsages.reduce(
        (max, usage) => Math.max(max, usage.length),
        0,
    );
    const commandGap = 2;

    commandNames.forEach((name, idx) => {
        const description = commands[name].description;
        const usage = commandUsages[idx];
        help += `\n   ${usage.padEnd(maxCommandUsageLen)}${" ".repeat(commandGap)}${description}`;
    });

    help += "\n\n Options:";

    Object.keys(opts).forEach((option) => {
        help += `\n   ${opts[option]}`;
    });

    console.info(help);
    process.exit();

}
