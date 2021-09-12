const path = require("path");

const paths = require("./paths");

/**
 * @param {String} path
 * @returns
 */
module.exports = (p) => {
  return p === "/" ? paths.locations.files : path.join(`${paths.locations.files}/${p}`);
};
