const fs = require("fs");

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
