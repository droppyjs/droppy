import escRe from "escape-string-regexp";
import { createCommand } from "../command/index.js";
import log from "../services/log/index.js";
import storage from "../services/storage/index.js";
import { utils } from "../utils/index.js";

interface ClipboardMessage {
    data: {
        src: string;
        dst: string;
        type: "cut" | "copy";
    };
}
export default createCommand<ClipboardMessage>(
    "CLIPBOARD",
    async ({ validatePaths, sid, config, msg, ws, vId, sendError }) => {
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

        const destinationExists = await storage.exists(
            utils.addFilesPath(msg.data.dst),
        );

        let destination = msg.data.dst;
        if (destinationExists || msg.data.src === msg.data.dst) {
            destination = utils.removeFilesPath(
                utils.addFilesPath(msg.data.dst),
            );
        }

        if (msg.data.type === "cut") {
            storage.move(msg.data.src, destination);
        } else if (msg.data.type === "copy") {
            storage.copy(msg.data.src, destination);
        }
    },
);
