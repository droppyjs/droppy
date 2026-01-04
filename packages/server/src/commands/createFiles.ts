import path from "node:path";

import log from "../services/log/index.js";
import storage from "../services/storage/index.js";
import { utils } from "../utils/index.js";
import type { CommandHandler } from "./index.js";

interface CreateFilesMessage {
    data: {
        files: string[];
    };
    type: string;
}
export const CREATE_FILES: CommandHandler<CreateFilesMessage> = {
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
        if (!validatePaths(msg.data.files, msg.type, ws, sid, vId)) {
            return;
        }

        for (const file of msg.data.files) {
            try {
                await storage.makekDir(utils.addFilesPath(path.dirname(file)));
                await storage.makeFile(utils.addFilesPath(file));
            } catch (err) {
                log.error(ws, null, err);
                sendError(sid, vId, `Error creating file`);
            }
        }
    },
};
