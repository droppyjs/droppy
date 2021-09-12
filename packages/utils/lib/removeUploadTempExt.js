/**
 *
 * @param {string} path
 * @returns
 */
module.exports = (path) => path.replace(/(^\/?[^/]+)(\.droppy-upload)/, (_, p1) => p1);
