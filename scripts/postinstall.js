//           .:.
//    :::  .:::::.    Droppy
//  ..:::..  :::      Made with love <3
//   ':::'   :::
//     '
// Droppy postinstall.js file
// This file is used as part of our automation workflow.
// This allows yarn to automatically execute should there be a change to the yarn lock file.

const {execSync} = require("child_process")
const path = require("path")

const consoleLog = require("./helpers/consoleLog")

const log = (level, message) => consoleLog("droppy-pi", level, message)

const rootDirectory = path.resolve(__dirname, "..")

log("info", "Calling lerna bootstrap.")

// Execute yarn bootstrap to ensure lerna is up to date
execSync("yarn bootstrap", {cwd: rootDirectory})

// Install husky hooks that might be missing
execSync("yarn husky install", {cwd: rootDirectory})
