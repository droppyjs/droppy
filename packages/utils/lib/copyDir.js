const fs = require("fs");
const path = require("path");
const {mkdir, lstat, copyFile, readdir} = fs.promises;

/**
 * Copy a directory.
 * @param {fs.PathLike} src
 * @param {fs.PathLike} dest
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
