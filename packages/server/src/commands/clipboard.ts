import fs from "node:fs";
import escRe from "escape-string-regexp";

import filetree from "../services/filetree/index.js";
import log from "../services/log/index.js";
import { utils } from "../utils/index.js";

import type { CommandHandler } from "./index.js";

interface ClipboardMessage {
    data: {
        src: string;
        dst: string;
        type: "cut" | "copy";
    };
}
export const CLIPBOARD: CommandHandler<ClipboardMessage> = {
    handler: async ({
        validatePaths,
        sid,
        config,
        msg,
        ws,
        vId,
        sendError,
    }) => {
        const src = msg.data.src;
        const dst = msg.data.dst;
        const type = msg.data.type;

        log.info(ws, null, `Clipboard ${type}: ${src} -> ${dst}`);

        if (config.readOnly) {
            return sendError(sid, vId, "Files are read-only");
        }

        if (!validatePaths([src, dst], msg.data.type, ws, sid, vId)) {
            return;
        }

        if (new RegExp(`^${escRe(msg.data.src)}/`).test(msg.data.dst)) {
            return sendError(sid, vId, "Can't copy directory into itself");
        }

        fs.stat(utils.addFilesPath(msg.data.dst), async (err, stats) => {
            if ((!err && stats) || msg.data.src === msg.data.dst) {
                utils.getNewPath(utils.addFilesPath(msg.data.dst), (newDst) => {
                    filetree.clipboard(
                        msg.data.src,
                        utils.removeFilesPath(newDst),
                        msg.data.type,
                    );
                });
            } else {
                filetree.clipboard(msg.data.src, msg.data.dst, msg.data.type);
            }
        });
    },
};
