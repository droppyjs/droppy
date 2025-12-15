#!/usr/bin/env node

import minimist from "minimist";
import { executeRemoteCommand, printHelp } from "../lib/cli.js";

const argv = minimist(process.argv.slice(2), {
  boolean: ["color"],
  string: ["content", "file", "api-key"],
});

if (!argv._.length) {
  printHelp();
  process.exit(0);
}

const cmd = argv._[0];
const args = argv._.slice(1);

if (args.length < 1) {
  console.error("Error: URL required");
  printHelp();
  process.exit(1);
}

executeRemoteCommand(cmd, args, argv).then((result) => {
  process.exit(result.exitCode);
});
