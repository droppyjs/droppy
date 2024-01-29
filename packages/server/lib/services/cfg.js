"use strict";

const fs = require("fs");
const {dirname} = require("path");
const {promisify} = require("util");

const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);

const paths = require("./paths.js");

const defaults = {
  listeners: [{
    host: ["0.0.0.0", "::"],
    port: 8989,
    protocol: "http"
  }],
  public: false,
  timestamps: true,
  linkLength: 5,
  linkExtensions: false,
  logLevel: 2,
  maxFileSize: 0,
  updateInterval: 1000,
  pollingInterval: 0,
  keepAlive: 20000,
  uploadTimeout: 604800000,
  allowFrame: false,
  readOnly: false,
  ignorePatterns: [],
  watch: true,
  headers: {},
};

const hiddenOpts = ["dev"];

const cfg = module.exports = {};

cfg.init = (config) => new Promise(async (resolve, reject) => {
  const configFile = paths.get().cfgFile;
  if (typeof config === "object" && config !== null) {
    config = Object.assign({}, defaults, config);
    return resolve(config);
  } else {
    try {
      await stat(configFile);
    } catch (err) {
      if (err.code === "ENOENT") {
        config = defaults;
        await mkdir(dirname(configFile), {recursive: true});

        await write(configFile, config);
        resolve(config);
      } else {
        return reject(err);
      }
      return;
    }

    try {
      const data = await readFile(configFile);
      if (data) {
        config = JSON.parse(String(data));
      }
      if (!config) {
        config = {};
      }

      config = Object.assign({}, defaults, config);

      // TODO: validate more options
      if (typeof config.pollingInterval !== "number") {
        return reject(new TypeError("Expected a number for the 'pollingInterval' option"));
      }

      // Remove options no longer present
      Object.keys(config).forEach(key => {
        if (defaults[key] === undefined && !hiddenOpts.includes(key)) {
          delete config[key];
        }
      });
      await write(configFile, config);
      return resolve(config);
    } catch (err) {
      // TODO: can we print helpful information here?
      return reject(err);
    }
  }
});

function write(configFile, config) {
  return new Promise((resolve, reject) => {
    fs.writeFile(configFile, JSON.stringify(config, null, 2), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
