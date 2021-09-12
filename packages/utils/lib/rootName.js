/**
 *
 * @param {string} path
 * @returns
 */
module.exports = (path) => path.split("/").find(p => !!p);
