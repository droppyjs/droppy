const {mkdir} = require("fs").promises;

module.exports = async (dir, callback) => {
  for (const d of (Array.isArray(dir) ? dir : [dir])) {
    await mkdir(d, {mode: "755", recursive: true});
  }
  callback();
};
