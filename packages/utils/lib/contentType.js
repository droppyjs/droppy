const mimeTypes = require("mime-types");
const isbinaryfile = require("isbinaryfile");

const overrideMimeTypes = {
  "video/x-matroska": "video/webm",
};

/**
 * @param {String} p
 * @returns
 */
module.exports = function(p) {
  const type = mimeTypes.lookup(p);
  if (overrideMimeTypes[type]) {
    return overrideMimeTypes[type];
  }

  if (type) {
    const charset = mimeTypes.charsets.lookup(type);
    return type + (charset ? `; charset=${charset}` : "");
  } else {
    try {
      return isbinaryfile.isBinaryFileSync(p) ? "application/octet-stream" : "text/plain";
    } catch {
      return "application/octet-stream";
    }
  }
};
