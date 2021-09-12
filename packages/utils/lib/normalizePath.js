/**
 * @param {String} path
 * @returns
 */
module.exports = (path) => path.replace(/[\\|/]+/g, "/");
