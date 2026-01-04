import log from "../services/log/index.js";
import storage from "../services/storage/index.js";

import type { CommandHandler } from "./index.js";

interface CreateFolderMessage {
    data: string;
    type: string;
}

export const CREATE_FOLDER: CommandHandler<CreateFolderMessage> = {
    handler: async ({
        validatePaths,
        sid,
        config,
        msg,
        ws,
        vId,
        sendError,
    }) => {
        if (config.readOnly) {
            return sendError(sid, vId, "Files are read-only");
        }
        if (!validatePaths(msg.data, msg.type, ws, sid, vId)) {
            return;
        }

        try {
            await storage.makekDir(msg.data);
        } catch (err) {
            log.error(ws, null, err);
            const error = err instanceof Error ? err : new Error(String(err));
            sendError(sid, vId, `Error creating folder: ${error.message}`);
        }
    },
};
