const {unlink} = require("fs").promises;

/**
 *
 * @param {string} path
 * @param {CallableFunction} callback
 */
module.exports = async (path, callback) => {
  unlink(path).then(callback);
};
