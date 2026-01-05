import { createCommand } from "../command/index.js";
import db from "../services/db/index.js";
import log from "../services/log/index.js";
import storage from "../services/storage/index.js";

interface RenameMessage {
    data: {
        src: string;
        dst: string;
    };
    type: string;
}

export default createCommand<RenameMessage>(
    "RENAME",
    async ({ validatePaths, sid, config, sendError, msg, ws, vId }) => {
        if (config.readOnly) {
            return sendError(sid, vId, "Files are read-only");
        }

        const rSrc = msg.data.src;
        const rDst = msg.data.dst;

        // Disallow whitespace-only and empty strings in renames
        if (
            !validatePaths([rSrc, rDst], msg.type, ws, sid, vId) ||
            /^\s*$/.test(rDst) ||
            rDst === "" ||
            rSrc === rDst
        ) {
            log.info(ws, null, `Invalid rename request: ${rSrc}-> ${rDst}`);
            sendError(sid, vId, "Invalid rename request");
            return;
        }

        try {
            await storage.move(rSrc, rDst);
        } catch (err) {
            log.error(ws, null, err);
            sendError(
                sid,
                vId,
                `Error renaming ${rSrc} to ${rDst}: ${err instanceof Error ? err.message : String(err)}`,
            );
            return;
        }

        // update sharelinks to new destination
        await db.setRecordsWhere(
            "links",
            { location: rSrc },
            { location: rDst },
        );

        log.info(ws, null, `Share link updated: ${rSrc} -> ${rDst}`);
    },
);
