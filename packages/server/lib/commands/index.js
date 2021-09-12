const {readdirSync} = require("fs");
const path = require("path");
const log = require("../services/log");
const files = readdirSync(__dirname);

module.exports = files.reduce((result, current) => {
  if (current !== "index.js") {
    const {command, handler} = require(path.join(__dirname, current)).default;
    if (command === undefined || handler === undefined) {
      log.error(`Attempted to register ${current} however, ` +
                `.command is "${command ? "OK" : "invalid"}", ` +
                `and .handler is "${handler ? "OK" : "invalid"}"`);
    } else {
      result[command] = handler;
    }
  }
  return result;
}, {});
