const os = require("os");

/**
 * Function originaly from https://github.com/sindresorhus/untildify
 * Copyright (c) Sindre Sorhus
 * Copyright (c) Contributors
 * @param {string} pathWithTilde
 * @returns
 */
module.exports = (pathWithTilde) => {
  const homeDirectory = os.homedir();
  return homeDirectory ? pathWithTilde.replace(/^~(?=$|\/|\\)/, homeDirectory) : pathWithTilde;
};
