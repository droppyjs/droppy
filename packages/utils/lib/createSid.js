const crypto = require("crypto");

module.exports = function() {
  return crypto.randomBytes(64).toString("base64").substring(0, 48);
};
