const fs = require("fs");

/**
 *
 * @param {string} p
 * @param {CallableFunction} cb
 * @returns
 */
module.exports = function(p, cb) {
  if (typeof p !== "string") return cb(null);
  fs.stat(p, (_, stats) => {
    if (stats && stats.isFile()) {
      fs.readFile(p, (err, data) => {
        if (err) return cb(err);
        cb(null, String(data));
      });
    } else {
      cb(null);
    }
  });
};
