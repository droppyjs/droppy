import { db } from "@droppyjs/server";
import type { Argv, Pkg } from "../types.js";
import { printUsers } from "../util/printUsers.js";
import { help } from "./help.js";

export async function add(pkg: Pkg, argv: Argv) {
    const args = argv._.slice(1);

    if (args.length !== 2 && args.length !== 3) {
        help(pkg, argv);
    } else {
        db.load(() => {
            db.addOrUpdateUser(args[0], args[1], args[2] === "p");
            printUsers(db.get("users"));
        });
    }
}
