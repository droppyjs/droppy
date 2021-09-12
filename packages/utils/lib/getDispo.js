const contentDisposition = require("content-disposition");
const path = require("path");

/**
 *
 * @param {string} fileName
 * @param {boolean} download
 * @returns
 */
module.exports = (fileName, download) => {
  return contentDisposition(path.basename(fileName), {type: download ? "attachment" : "inline"});
};
