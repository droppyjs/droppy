import crypto from "node:crypto";
import db from "../db/db.js";

export async function addOrUpdateUser(
    user: string,
    password: string,
    privileged: boolean,
) {
    const salt = crypto.randomBytes(4).toString("hex");

    db.setRecord("users", user, {
        hash: `${getHash(password + salt + user)}$${salt}`,
        privileged,
    });
}

export async function delUser(user: string) {
    const userRecord = await db.getRecord("users", user);
    if (userRecord) {
        await db.deleteRecord("users", user);
        await db.deleteRecordsWhere("sessions", { username: user });
        return true;
    } else {
        return false;
    }
}

export async function authUser(user, pass) {
    const userRecord = await db.getRecord("users", user);
    if (!userRecord) {
        return false;
    }

    const parts = userRecord.hash.split("$");

    if (parts.length === 2 && parts[0] === getHash(pass + parts[1] + user)) {
        return true;
    }

    return false;
}

function getHash(string: string) {
    return crypto.createHmac("sha256", string).digest("hex");
}

export default {
    addOrUpdateUser,
    delUser,
    authUser,
};
