const escapeStringRegexp = require("escape-string-regexp");

/**
 * @param {string[]} arr
 * @returns {RegExp}
 */
module.exports = (arr) => {
  arr = arr.map(ext => {
    return escapeStringRegexp(ext);
  });
  return new RegExp(`\\.(${arr.join("|")})$`, "i");
};
