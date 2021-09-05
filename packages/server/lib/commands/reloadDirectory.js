const filetree = require("../services/filetree.js");

exports.default = {
  handler: async ({validatePaths, sid, sendFiles, msg, ws, vId}) => {
    if (!validatePaths(msg.data.dir, msg.type, ws, sid, vId)) {
      return;
    }

    await filetree.updateDir(msg.data.dir);

    sendFiles(sid, vId);
  }
};
