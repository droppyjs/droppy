const escapeStringRegexp = require("escape-string-regexp");

const paths = require("./paths");

/**
 * @param {string} str
 * @returns
 */
module.exports = (str) => {
  return (str || "").replace(new RegExp(escapeStringRegexp(paths.locations.files), "g"), "");
};
