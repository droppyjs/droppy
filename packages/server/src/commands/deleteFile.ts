import filetree from "../services/filetree.js";
import log from "../services/log.js";

import type { CommandHandler } from "./index.js";

interface DeleteFileMessage {
    data: string[];
    type: string;
}

export const DELETE_FILE: CommandHandler<DeleteFileMessage> = {
    handler: async ({
        validatePaths,
        sid,
        config,
        msg,
        ws,
        vId,
        sendError,
    }) => {
        if (!Array.isArray(msg.data)) {
            sendError(sid, vId, "Invalid data");
            return;
        }

        if (config.readOnly) {
            log.info(ws, null, `Prevent deleting read-only file: ${msg.data}`);
            return sendError(sid, vId, "Files are read-only");
        }

        for (const path of msg.data) {
            if (typeof path !== "string") {
                sendError(sid, vId, "Invalid data");
                return;
            }

            if (!validatePaths(path, msg.type, ws, sid, vId)) {
                sendError(sid, vId, `No permission to delete file: ${path}`);
                return;
            }

            log.info(ws, null, `Deleting: ${path}`);

            try {
                await filetree.del(path);
            } catch (err) {
                log.info(ws, null, `Error deleting file: ${path}`);
                log.error(err);
                sendError(sid, vId, `Error deleting: ${path}`);
            }
        }
    },
};
