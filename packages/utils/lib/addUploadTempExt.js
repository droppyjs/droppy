/**
 * @param {string} path
 * @returns
 */
module.exports = (path) => path.replace(/(\/?[^/]+)/, (_, p1) => `${p1}.droppy-upload`);
