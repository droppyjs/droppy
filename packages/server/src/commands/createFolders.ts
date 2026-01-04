import filetree from "../services/filetree/index.js";
import log from "../services/log.js";
import utils from "../services/utils.js";
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
                await filetree.mkdir(utils.addFilesPath(folder));
            } catch (err) {
                log.error(ws, null, err);
                sendError(sid, vId, `Error creating folder ${folder}`);
            }
        }
    },
};
