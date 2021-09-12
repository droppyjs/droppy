const path = require("path");
const isbinaryfile = require("isbinaryfile");

const forceBinaryTypes = [
  "pdf",
  "ps",
  "eps",
  "ai",
];

/**
 *
 * @param {String} p
 * @returns
 */
module.exports = async function(p) {
  if (forceBinaryTypes.includes(path.extname(p).substring(1))) {
    return true;
  }

  return isbinaryfile.isBinaryFile(p);
};
