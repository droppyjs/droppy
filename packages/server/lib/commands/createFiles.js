const path = require("path");

const filetree = require("../services/filetree");
const utils = require("../services/utils");
const log = require("../services/log");

exports.default = {
  handler: async ({validatePaths, sid, config, msg, ws, vId, sendError}) => {
    if (config.readOnly) {
      return sendError(sid, vId, "Files are read-only");
    }
    if (!validatePaths(msg.data.files, msg.type, ws, sid, vId)) {
      return;
    }

    await Promise.all(msg.data.files.map(file => {
      return new Promise(resolve => {
        filetree.mkdir(utils.addFilesPath(path.dirname(file)), (err) => {
          if (err) log.error(ws, null, err);
          filetree.mk(utils.addFilesPath(file), (err) => {
            if (err) log.error(ws, null, err);
            resolve();
          });
        });
      });
    }));
  }
};
