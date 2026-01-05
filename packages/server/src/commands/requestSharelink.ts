import path from "node:path";
import { createCommand } from "../command/index.js";
import db from "../services/db/index.js";
import log from "../services/log/index.js";
import { utils } from "../utils/index.js";

interface RequestSharelinkMessage {
    data: {
        location: string;
        isAttachment: boolean;
    };
    type: string;
}

export default createCommand<RequestSharelinkMessage>(
    "REQUEST_SHARELINK",
    async ({ validatePaths, sid, sendObj, config, msg, ws, vId }) => {
        if (!validatePaths(msg.data.location, msg.type, ws, sid, vId)) {
            return;
        }

        const isAttachment = msg.data.isAttachment;

        const links = await db.getRecordsWhere("links", {
            location: msg.data.location,
            isAttachment,
        });

        for (const link of links) {
            const ext = link.ext || path.extname(link.location);
            sendObj(sid, {
                type: "SHARELINK",
                vId,
                link: config.linkExtensions && ext ? link._id + ext : link._id,
                isAttachment,
            });
        }

        if (links.length > 0) {
            return;
        }

        const link = utils.getLink(links, config.linkLength);
        const ext = path.extname(msg.data.location);
        log.info(
            ws,
            null,
            `Share link created: ${link} -> ${msg.data.location}`,
        );

        await db.addOrUpdateRecord("links", link, {
            location: msg.data.location,
            isAttachment,
            ext,
        });

        sendObj(sid, {
            type: "SHARELINK",
            vId,
            link: config.linkExtensions ? link + ext : link,
            isAttachment: isAttachment,
        });
    },
);
