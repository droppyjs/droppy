const util = require("util");

/**
 *
 * @param {*} data
 * @returns
 */
const pretty =  async (data) => {
  return util.inspect(data, {colors: true})
    .replace(/^\s+/gm, " ")
    .replace(/\s+$/gm, "")
    .replace(/[\r\n]+/gm, "");
};

module.exports = pretty;
