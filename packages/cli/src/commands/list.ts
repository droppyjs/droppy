import { db } from "@droppyjs/server";
import type { Argv, Pkg } from "../types.js";
import { printUsers } from "../util/printUsers.js";

export async function list(_pkg: Pkg, _argv: Argv) {
    await db.load();
    printUsers(await db.getRecordsWhere("users", {}));
}
