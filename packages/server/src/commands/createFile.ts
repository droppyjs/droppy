import { createCommand } from "../command/index.js";
import log from "../services/log/index.js";
import storage from "../services/storage/index.js";

interface CreateFileMessage {
    data: string;
    type: string;
}
export default createCommand<CreateFileMessage>(
    "CREATE_FILE",
    async ({ validatePaths, sid, config, msg, ws, vId, sendError }) => {
        if (config.readOnly) {
            return sendError(sid, vId, "Files are read-only");
        }
        if (!validatePaths(msg.data, msg.type, ws, sid, vId)) {
            return;
        }

        try {
            await storage.makeFile(msg.data);
        } catch (err) {
            log.error(ws, null, err);
            const error = err instanceof Error ? err : new Error(String(err));
            sendError(sid, vId, `Error creating file: ${error.message}`);
        }
    },
);
