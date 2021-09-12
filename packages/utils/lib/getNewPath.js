const path = require("path");
const {stat, access} = require("fs").promises;

// eslint-disable-next-line no-unused-vars
const {PathLike} = require("fs");

/**
 *
 * @param {PathLike} origPath
 * @param {*} callback
 * @returns
 */
module.exports = async (origPath, callback) => {
  let stats;
  try {
    stats = await stat(origPath);
  } catch {
    return callback(origPath);
  }

  let filename = path.basename(origPath);
  const dirname = path.dirname(origPath);
  let extension = "";

  if (filename.includes(".") && stats.isFile()) {
    extension = filename.substring(filename.lastIndexOf("."));
    filename = filename.substring(0, filename.lastIndexOf("."));
  }

  if (!/-\d+$/.test(filename)) filename += "-1";

  let canCreate = false;
  while (!canCreate) {
    const num = parseInt(filename.substring(filename.lastIndexOf("-") + 1));
    filename = filename.substring(0, filename.lastIndexOf("-") + 1) + (num + 1);
    try {
      await access(path.join(dirname, filename + extension));
    } catch {
      canCreate = true;
    }
  }

  callback(path.join(dirname, filename + extension));
};
