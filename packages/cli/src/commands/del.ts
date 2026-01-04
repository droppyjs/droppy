import { db, users } from "@droppyjs/server";
import type { Argv, Pkg } from "../types.js";
import { printUsers } from "../util/printUsers.js";
import { help } from "./help.js";

export async function del(pkg: Pkg, argv: Argv) {
    const args = argv._.slice(1);

    if (args.length !== 1) {
        help(pkg, argv);
    } else {
        await db.load();
        await users.delUser(args[0]);
        printUsers(await db.getRecordsWhere("users", {}));
    }
}
