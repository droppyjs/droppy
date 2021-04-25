//           .:.
//    :::  .:::::.    Droppy
//  ..:::..  :::      Made with love <3
//   ':::'   :::
//     '
// Droppy postmerge.js file
// This file is used as part of our automation workflow.
// This allows yarn to automatically execute should there be a change to the yarn lock file.

const {execSync} = require("child_process")
const fs = require("fs")
const path = require("path")

const consoleLog = require("./helpers/consoleLog")
const hashPath = require("./helpers/hashPath")

const log = (level, message) => consoleLog("droppy-pm", level, message)

const rootDirectory = path.resolve(__dirname, "..")
const cacheDirectory = path.resolve(rootDirectory, "node_modules", ".cache")

const yarnLockHashFile = path.resolve(rootDirectory, "node_modules", ".cache", "yarn_lock.md5")
const yarnLockFile = path.resolve(rootDirectory, "yarn.lock")

let dirty = false
if (!fs.existsSync(yarnLockHashFile)) {
  log("info", "No hash of lock file.")
  dirty = true
} else {
  const hash = fs.readFileSync(yarnLockHashFile).toString()

  const exepctedHash = hashPath(yarnLockFile)

  if (hash !== exepctedHash) {
    dirty = true
    log("info", "Lock file hash changed.")
  }
}

if (dirty) {
  log("info", "Flagged dirty.")
  if (!fs.existsSync(cacheDirectory)) {
    fs.mkdirSync(cacheDirectory, {recursive: true})
  }

  log("info", "Executing yarn.")
  execSync("yarn", {cwd: rootDirectory})

  const newHash = hashPath(yarnLockFile)

  log("info", "New hash: " + newHash)

  fs.writeFileSync(yarnLockHashFile, newHash)
} else {
  // Only call lerna bootstrap if we need to, as postinstall will handle it for us if dirty.
  log("info", "Calling lerna bootstrap.")

  // Execute yarn bootstrap to ensure lerna is up to date
  execSync("yarn bootstrap", {cwd: rootDirectory})
}
