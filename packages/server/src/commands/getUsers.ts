import { createCommand } from "../command/index.js";

export default createCommand(
    "GET_USERS",
    async ({ priv, sid, config, sendUsers }) => {
        if (priv && !config.public) {
            sendUsers(sid);
        }
    },
);
