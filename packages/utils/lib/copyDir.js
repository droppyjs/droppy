const {mkdir, lstat, copyFile, readdir} = require("fs").promises;
const path = require("path");

/**
 * Copy a directory.
 * @param {String} src
 * @param {String} dest
 */
const copyDir =  async (src, dest) => {
  await mkdir(dest);

  for (const file of await readdir(src)) {
    if ((await lstat(path.join(src, file))).isFile()) {
      await copyFile(path.join(src, file), path.join(dest, file));
    } else {
      await copyDir(path.join(src, file), path.join(dest, file));
    }
  }
};

module.exports = copyDir;
