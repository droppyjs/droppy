import { createCommand } from "../command/index.js";
import storage from "../services/storage/index.js";

interface ReloadDirectoryMessage {
    data: {
        dir: string;
    };
    type: string;
}

export default createCommand<ReloadDirectoryMessage>(
    "RELOAD_DIRECTORY",
    async ({ validatePaths, sid, sendFiles, msg, ws, vId }) => {
        if (!validatePaths(msg.data.dir, msg.type, ws, sid, vId)) {
            return;
        }

        await storage.refreshDir(msg.data.dir);

        sendFiles(sid, vId);
    },
);
