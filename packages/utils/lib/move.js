const mv = require("mv");

module.exports = async (src, dst, callback) => {
  mv(src, dst, (err) => {
    if (callback) {
      callback(err);
    }
  });
};
