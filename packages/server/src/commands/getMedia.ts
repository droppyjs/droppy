import path from "node:path";
import { imageSize } from "image-size";

import filetree from "../services/filetree.js";
import log from "../services/log.js";
import utils from "../services/utils.js";

import type { CommandHandler } from "./index.js";

interface GetMediaMessage {
    data: {
        dir: string;
        exts: {
            img: string[];
            vid: string[];
            pdf: string[];
        }
    }
    type: string;
}
export const GET_MEDIA: CommandHandler<GetMediaMessage> = {
    handler: async ({
        validatePaths,
        sid,
        msg,
        ws,
        vId,
        sendError,
        sendObj,
    }) => {
        const dir = msg.data.dir;
        const exts = msg.data.exts;
        if (!validatePaths(dir, msg.type, ws, sid, vId)) {
            return;
        }

        const allExts = exts.img.concat(exts.vid).concat(exts.pdf);
        const files = filetree.lsFilter(dir, utils.extensionRe(allExts));
        if (!files) {
            return sendError(sid, vId, "No displayable files in directory");
        }

        const mediaFiles = await Promise.all(
            files.map((file) => {
                return new Promise((resolve) => {
                    if (utils.extensionRe(exts.pdf).test(file)) {
                        resolve({ pdf: true, src: file });
                    } else if (utils.extensionRe(exts.img).test(file)) {
                        const input = path.join(utils.addFilesPath(dir), file);
                        imageSize(input, (err, dims) => {
                            let width: number | undefined, height: number | undefined;
                            if (err) {
                                log.error(err);
                            }

                            if (dims) {
                                if (
                                    dims.orientation === 6 ||
                                    dims.orientation === 8
                                ) {
                                    height = dims.width;
                                    width = dims.height;
                                } else {
                                    width = dims.width;
                                    height = dims.height;
                                }

                            }

                            resolve({
                                src: file,
                                w: width ? width : 0,
                                h: height ? height : 0,
                            });
                        });
                    } else {
                        resolve({ video: true, src: file });
                    }
                });
            }),
        );
        sendObj(sid, { type: "MEDIA_FILES", vId, files: mediaFiles });
    },
};
