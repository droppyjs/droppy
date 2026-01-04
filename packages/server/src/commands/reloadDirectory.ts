import filetree from "../services/filetree/index.js";

import type { CommandHandler } from "./index.js";

interface ReloadDirectoryMessage {
    data: {
        dir: string;
    };
    type: string;
}

export const RELOAD_DIRECTORY: CommandHandler<ReloadDirectoryMessage> = {
    handler: async ({ validatePaths, sid, sendFiles, msg, ws, vId }) => {
        if (!validatePaths(msg.data.dir, msg.type, ws, sid, vId)) {
            return;
        }

        await filetree.updateDir(msg.data.dir);

        sendFiles(sid, vId);
    },
};
