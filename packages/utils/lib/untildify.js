const os = require("os");
const homeDirectory = os.homedir();

/**
 * Function originaly from https://github.com/sindresorhus/untildify
 * Copyright (c) Sindre Sorhus
 * Copyright (c) Contributors
 * @param {string} pathWithTilde
 * @returns
 */
module.exports = (pathWithTilde) => {
  return homeDirectory ? pathWithTilde.replace(/^~(?=$|\/|\\)/, homeDirectory) : pathWithTilde;
};
