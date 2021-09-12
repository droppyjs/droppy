const util = require("util");

/**
 * Copy a directory.
 * @param {String} src
 * @param {String} dest
 */
const pretty =  async (data) => {
  return util.inspect(data, {colors: true})
    .replace(/^\s+/gm, " ").replace(/\s+$/gm, "")
    .replace(/[\r\n]+/gm, "");
};

module.exports = pretty;
