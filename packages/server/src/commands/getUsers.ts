import type { CommandHandler } from "./index.js";

export const GET_USERS: CommandHandler = {
    handler: async ({ priv, sid, config, sendUsers }) => {
        if (priv && !config.public) {
            sendUsers(sid);
        }
    },
};
