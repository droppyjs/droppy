import { createCommand } from "../command/index.js";
import storage from "../services/storage/index.js";

interface SearchMessage {
    data: {
        query: string;
        dir: string;
    };
    type: string;
}

export default createCommand<SearchMessage>(
    "SEARCH",
    async ({ validatePaths, sendObj, sid, msg, ws, vId }) => {
        const query = msg.data.query;
        const dir = msg.data.dir;
        if (!validatePaths(dir, msg.type, ws, sid, vId)) {
            return;
        }

        sendObj(sid, {
            type: "SEARCH_RESULTS",
            vId,
            folder: dir,
            query,
            results: await storage.search(query, dir),
        });
    },
);
