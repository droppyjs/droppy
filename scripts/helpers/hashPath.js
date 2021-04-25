const fs = require("fs")
const crypto = require("crypto")

const hashPath = (path) => {
  const yarnLock = fs.readFileSync(path).toString()

  const md5sum = crypto.createHash("md5")
  md5sum.update(yarnLock)

  const newHash = md5sum.digest("hex").toString()
  return newHash
}

module.exports = hashPath
