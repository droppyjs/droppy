"use strict";

const paths = module.exports = {};
const fs = require("fs");
const path = require("path");
const {untildify} = require(".");

const os = require("os");

const homedir = os.homedir();

let configDir = resolve(homedir, "/.droppy/config");
let filesDir = resolve(homedir, "/.droppy/files");

const clientPath = path.normalize(`${path.dirname(__dirname)}/../client/`);

paths.locations = {
  // Purposely so to be defined at start.
  homedir,
  files: "",
  config: "",

  pid: "",
  temp: "",
  cfgFile: "",
  db: "",
  tlsKey: "",
  tlsCert: "",
  tlsCA: "",

  mod: "",
  server: "",
  client: "",
  templates: "",
  svg: "",
};

paths.reload = () => {
  paths.locations = {
    homedir,

    files: resolve(filesDir),
    config: resolve(configDir),

    pid: resolve(configDir, "droppy.pid"),
    temp: resolve(configDir, "temp"),
    cfgFile: resolve(configDir, "config.json"),
    db: resolve(configDir, "db.json"),
    tlsKey: resolve(configDir, "tls.key"),
    tlsCert: resolve(configDir, "tls.cert"),
    tlsCA: resolve(configDir, "tls.ca"),

    mod: resolve(__dirname, ".."),
    server: resolve(__dirname, "..", "server"),
    client: clientPath,
    templates: resolve(clientPath, "lib", "templates"),
    svg: resolve(clientPath, "lib", "svg"),
  };
};

paths.seed = function(config, files) {
  if (config) configDir = config;
  if (files) filesDir = files;

  paths.reload();
};

function resolve(...args) {
  let p = path.join.apply(null, args);
  p = path.resolve(p.startsWith("~") ? untildify(p) : p);
  try {
    p = fs.realpathSync(p);
  } catch {}
  return p;
}

paths.reload();
