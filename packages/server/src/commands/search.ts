import storage from "../services/storage/index.js";

import type { CommandHandler } from "./index.js";

interface SearchMessage {
    data: {
        query: string;
        dir: string;
    };
    type: string;
}

export const SEARCH: CommandHandler<SearchMessage> = {
    handler: async ({ validatePaths, sendObj, sid, msg, ws, vId }) => {
        const query = msg.data.query;
        const dir = msg.data.dir;
        if (!validatePaths(dir, msg.type, ws, sid, vId)) {
            return;
        }

        sendObj(sid, {
            type: "SEARCH_RESULTS",
            vId,
            folder: dir,
            results: await storage.search(query, dir),
        });
    },
};
