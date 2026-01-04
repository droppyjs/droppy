import { db } from "@droppyjs/server";
import type { Argv, Pkg } from "../types.js";
import { printUsers } from "../util/printUsers.js";
import { help } from "./help.js";

export async function del(pkg: Pkg, argv: Argv) {
    const args = argv._.slice(1);

    if (args.length !== 1) {
        help(pkg, argv);
    } else {
        db.load(() => {
            db.delUser(args[0]);
            printUsers(db.get("users"));
        });
    }
}
