const paths = require("./paths");
const normalizePath = require("./normalizePath");

/**
 *
 * @param {string} path
 * @returns
 */
module.exports = (path) => {
  if (path.length > paths.locations.files.length) {
    return normalizePath(path.substring(paths.locations.files.length));
  } else if (path === paths.locations.files) {
    return "/";
  }
};
