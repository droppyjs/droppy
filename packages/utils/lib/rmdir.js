const {rmdir} = require("fs").promises;

/**
 *
 * @param {string} path
 * @param {CallableFunction} callback
 */
module.exports = (p, cb) => {
  rmdir(p, {recursive: true}).then(cb);
};
