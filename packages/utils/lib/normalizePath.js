/**
 * @param {string} path
 * @returns
 */
module.exports = (path) => path.replace(/[\\|/]+/g, "/");
