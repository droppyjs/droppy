const path = require("path");
const imgSize = require("image-size");

const filetree = require("../services/filetree");
const log = require("../services/log");
const utils = require("../services/utils");

exports.default = {
  handler: async ({validatePaths, sid, msg, ws, vId, sendError, sendObj}) => {
    const dir = msg.data.dir;
    const exts = msg.data.exts;
    if (!validatePaths(dir, msg.type, ws, sid, vId)) return;
    const allExts = exts.img.concat(exts.vid).concat(exts.pdf);
    const files = filetree.lsFilter(dir, utils.extensionRe(allExts));
    if (!files) return sendError(sid, vId, "No displayable files in directory");

    const mediaFiles = await Promise.all(files.map(file => {
      return new Promise(resolve => {
        if (utils.extensionRe(exts.pdf).test(file)) {
          resolve({pdf: true, src: file});
        } else if (utils.extensionRe(exts.img).test(file)) {
          imgSize(path.join(utils.addFilesPath(dir), file), (err, dims, width, height) => {
            if (err) log.error(err);

            if (dims.orientation === 6 || dims.orientation === 8) {
              height = dims && dims.width;
              width = dims && dims.height;
            } else {
              width = dims && dims.width;
              height = dims && dims.height;
            }

            resolve({
              src: file,
              w: width ? width : 0,
              h: height ? height : 0,
            });
          });
        } else {
          resolve({video: true, src: file});
        }
      });
    }));
    sendObj(sid, {type: "MEDIA_FILES", vId, files: mediaFiles});
  }
};
