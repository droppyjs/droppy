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
 * @param {string} p
 * @returns {boolean}
 */
module.exports = async function(p) {
  if (forceBinaryTypes.includes(path.extname(p).substring(1))) {
    return true;
  }

  return await isbinaryfile.isBinaryFile(p);
};
