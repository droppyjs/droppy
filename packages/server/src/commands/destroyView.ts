import type { CommandHandler } from "./index.js";

export const DESTROY_VIEW: CommandHandler = {
    handler: async ({ sid, vId, setView }) => {
        setView(sid, vId, null);
    },
};
