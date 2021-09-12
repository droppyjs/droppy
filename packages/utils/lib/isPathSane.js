const validate = require("valid-filename");

/**
 * @param {String} p
 * @param {String} isURL
 * @returns
 */
module.exports = (p, isURL) => {
  if (isURL) {
    // Navigating up/down the tree
    if (/(?:^|[\\/])\.\.(?:[\\/]|$)/.test(p)) {
      return false;
    }

    // Invalid URL path characters
    if (!/^[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=%]+$/.test(p)) {
      return false;
    }
    return true;
  } else {
    return p.split(/[\\/]/gm).every(name => {
      if (name === "." || name === "..") return false;
      if (!name) return true;
      return validate(name); // will reject invalid filenames on Windows
    });
  }
};
