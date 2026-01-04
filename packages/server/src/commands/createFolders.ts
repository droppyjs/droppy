import log from "../services/log/index.js";
import storage from "../services/storage/index.js";
import { utils } from "../utils/index.js";
import type { CommandHandler } from "./index.js";

interface CreateFoldersMessage {
    data: {
        folders: string[];
    };
    type: string;
}

export const CREATE_FOLDERS: CommandHandler<CreateFoldersMessage> = {
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

        if (!validatePaths(msg.data.folders, msg.type, ws, sid, vId)) {
            return;
        }

        for (const folder of msg.data.folders) {
            try {
                await storage.makekDir(utils.addFilesPath(folder));
            } catch (err) {
                log.error(ws, null, err);
                sendError(sid, vId, `Error creating folder ${folder}`);
            }
        }
    },
};
