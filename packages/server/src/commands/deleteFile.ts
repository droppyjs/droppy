import { createCommand } from "../command/index.js";
import log from "../services/log/index.js";
import storage from "../services/storage/index.js";

interface DeleteFileMessage {
    data: string[];
    type: string;
}

export default createCommand<DeleteFileMessage>(
    "DELETE_FILE",
    async ({ validatePaths, sid, config, msg, ws, vId, sendError }) => {
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
                await storage.delete(path);
            } catch (err) {
                log.info(ws, null, `Error deleting file: ${path}`);
                log.error(err);
                sendError(sid, vId, `Error deleting: ${path}`);
            }
        }
    },
);
