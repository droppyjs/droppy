const fs = require("fs");

/**
 *
 * @param {fs.PathLike} src
 * @param {fs.PathLike} dst
 * @returns
 */
module.exports = (src, dst) => {
  return new Promise((resolve, reject) => {
    let cbCalled = false;
    const read = fs.createReadStream(src);
    const write = fs.createWriteStream(dst);

    function done(err) {
      if (cbCalled) return;
      cbCalled = true;
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    }

    read.on("error", done);
    write.on("error", done);
    write.on("close", done);
    read.pipe(write);
  });
};
