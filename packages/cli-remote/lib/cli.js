#!/usr/bin/env node

"use strict";

import fs from "fs";
import minimist from "minimist";
import { fileURLToPath } from "url";
import { RemoteClient } from "./remote.js";

const cmds = {
  ping: "ping <url>                    Check if remote instance is reachable",
  list: "list <url> <path>             List directory contents on remote instance",
  read: "read <url> <path>             Read file from remote instance",
  write: "write <url> <path>            Write file to remote instance (requires --content or --file)",
  mkdir: "mkdir <url> <path>            Create directory on remote instance",
  delete: "delete <url> <path>           Delete file/directory on remote instance",
  move: "move <url> <source> <dest>     Move/rename file on remote instance",
};

const opts = {
  user: "--user <username>             Username for remote authentication",
  pass: "--pass <password>             Password for remote authentication",
  apiKey: "--api-key <key>              API key for remote authentication",
  content: "--content <text>             Content to write (for write command)",
  file: "--file <path>                 File path to read content from (for write command)",
};

export async function executeRemoteCommand(cmd, args, options = {}) {
  const url = args[0];
  const username = options.user || options.u || null;
  const password = options.pass || options.p || null;
  const apiKey = options["api-key"] || options.apiKey || null;

  if (!url) {
    console.error("Error: URL required");
    return { success: false, exitCode: 1 };
  }

  const client = new RemoteClient(url, username, password, apiKey);

  try {
    switch (cmd) {
    case "ping": {
      const result = await client.ping();
      console.info(JSON.stringify(result.data, null, 2));
      break;
    }

    case "list": {
      if (args.length < 2) {
        console.error("Error: path required for list command");
        printHelp();
        return { success: false, exitCode: 1 };
      }
      const path = args[1];
      const result = await client.list(path);
      console.info(JSON.stringify(result.data, null, 2));
      break;
    }

    case "read": {
      if (args.length < 2) {
        console.error("Error: path required for read command");
        printHelp();
        return { success: false, exitCode: 1 };
      }
      const path = args[1];
      const result = await client.read(path);
      if (result.data.encoding === "base64") {
        const buffer = Buffer.from(result.data.content, "base64");
        process.stdout.write(buffer);
      } else {
        console.info(result.data.content);
      }
      break;
    }

    case "write": {
      if (args.length < 2) {
        console.error("Error: path required for write command");
        printHelp();
        return { success: false, exitCode: 1 };
      }
      const path = args[1];
      let content = "";
      let encoding = "utf8";

      if (options.file) {
        try {
          const fileContent = fs.readFileSync(options.file);
          const isBinary = await isBinaryFile(options.file);
          if (isBinary) {
            content = fileContent.toString("base64");
            encoding = "base64";
          } else {
            content = fileContent.toString("utf8");
            encoding = "utf8";
          }
        } catch (err) {
          console.error(`Error reading file: ${err.message}`);
          return { success: false, exitCode: 1 };
        }
      } else if (options.content) {
        content = options.content;
        encoding = "utf8";
      } else {
        console.error("Error: either --content or --file must be provided");
        printHelp();
        return { success: false, exitCode: 1 };
      }

      const result = await client.write(path, content, encoding);
      console.info(JSON.stringify(result.data, null, 2));
      break;
    }

    case "mkdir": {
      if (args.length < 2) {
        console.error("Error: path required for mkdir command");
        printHelp();
        return { success: false, exitCode: 1 };
      }
      const path = args[1];
      const result = await client.mkdir(path);
      console.info(JSON.stringify(result.data, null, 2));
      break;
    }

    case "delete": {
      if (args.length < 2) {
        console.error("Error: path required for delete command");
        printHelp();
        return { success: false, exitCode: 1 };
      }
      const path = args[1];
      const result = await client.delete(path);
      console.info(JSON.stringify(result.data || { ok: true }, null, 2));
      break;
    }

    case "move": {
      if (args.length < 3) {
        console.error("Error: source and destination paths required for move command");
        printHelp();
        return { success: false, exitCode: 1 };
      }
      const source = args[1];
      const destination = args[2];
      const result = await client.move(source, destination);
      console.info(JSON.stringify(result.data || { ok: true }, null, 2));
      break;
    }

    default:
      console.error(`Error: unknown command '${cmd}'`);
      printHelp();
      return { success: false, exitCode: 1 };
    }
    return { success: true, exitCode: 0 };
  } catch (err) {
    if (err.statusCode === 401) {
      console.error(`Error: Unauthorized. Please provide valid credentials with --user and --pass`);
    } else if (err.statusCode === 403) {
      console.error(`Error: Forbidden. The instance may be in read-only mode.`);
    } else if (err.statusCode === 404) {
      console.error(`Error: Not found. The requested resource does not exist.`);
    } else if (err.code === "ECONNREFUSED") {
      console.error(`Error: Connection refused. Could not connect to ${url}`);
    } else if (err.code === "ENOTFOUND") {
      console.error(`Error: Host not found. Could not resolve ${new URL(url).hostname}`);
    } else {
      console.error(`Error: ${err.message}`);
    }
    return { success: false, exitCode: 1 };
  }
}

function printHelp() {
  let help = `Usage: droppy-remote <command> <url> [args] [options]\n\n Commands:`;

  Object.keys(cmds).forEach((command) => {
    help += `\n   ${cmds[command]}`;
  });

  help += "\n\n Options:";

  Object.keys(opts).forEach((option) => {
    help += `\n   ${opts[option]}`;
  });

  help += `\n\nExamples:
  droppy-remote ping http://localhost:8989
  droppy-remote list http://localhost:8989 / --user admin --pass secret
  droppy-remote list http://localhost:8989 / --api-key your-api-key-here
  droppy-remote read http://localhost:8989 /file.txt --user admin --pass secret
  droppy-remote read http://localhost:8989 /file.txt --api-key your-api-key-here
  droppy-remote write http://localhost:8989 /new.txt --content "Hello" --user admin --pass secret
  droppy-remote write http://localhost:8989 /file.txt --file ./local.txt --api-key your-api-key-here
  droppy-remote mkdir http://localhost:8989 /newdir --user admin --pass secret
  droppy-remote delete http://localhost:8989 /old.txt --user admin --pass secret
  droppy-remote move http://localhost:8989 /old.txt /new.txt --user admin --pass secret
`;

  console.info(help);
  process.exit();
}

async function isBinaryFile(filePath) {
  try {
    const buffer = fs.readFileSync(filePath, { encoding: null });
    const chunk = buffer.slice(0, 512);
    for (let i = 0; i < chunk.length; i++) {
      if (chunk[i] === 0) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

// Export functions for use by main CLI and binary
export { printHelp };

// If this file is executed directly, run as CLI
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] && (process.argv[1] === __filename || process.argv[1].endsWith("cli.js"))) {
  const argv = minimist(process.argv.slice(2), {
    boolean: ["color"],
    string: ["user", "pass", "content", "file", "api-key"],
  });

  if (!argv._.length || argv.help || argv.h) {
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
}
