import { magenta } from "colorette";
import { createCommand } from "../command/index.js";
import db from "../services/db/index.js";
import log from "../services/log/index.js";
import users from "../services/users/index.js";

interface UpdateUserMessage {
    data: {
        name: string;
        pass: string;
        priv: boolean;
    };
}

export default createCommand<UpdateUserMessage>(
    "UPDATE_USER",
    async ({ priv, cookie, sid, msg, ws, sendUsers, sendError }) => {
        const name = msg.data.name;
        const pass = msg.data.pass;
        if (!priv) {
            return;
        }

        if (pass === "") {
            const user = await db.getRecord("users", name);
            if (!user) {
                return sendError(sid, null, "User not found");
            }

            const session = await db.getRecord("sessions", cookie);
            if (!session) {
                return sendError(sid, null, "Invalid session");
            }

            if (session.username === name) {
                return sendError(sid, null, "Cannot delete yourself");
            }

            await users.delUser(name);

            log.info(ws, null, "Deleted user: ", magenta(name));
        } else {
            const user = await db.getRecord("users", name);

            await users.addOrUpdateUser(name, pass, msg.data.priv || false);

            log.info(
                ws,
                null,
                `${user ? "Updated" : "Added"} user: `,
                magenta(name),
            );
        }
        sendUsers(sid);
    },
);
