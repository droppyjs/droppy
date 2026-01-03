#!/usr/bin/env node

import { existsSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";

import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check for DROPPY_CACHE_PATH, otherwise add default.
if (!("DROPPY_CACHE_PATH" in process.env)) {
    const cachePath = realpathSync(join(__dirname, "..", "dist", "cache.json"));
    if (existsSync(cachePath)) {
        process.env.DROPPY_CACHE_PATH = cachePath;
    }
}

// Check for DROPPY_CACHE_SKIP_VALIDATIONS, otherwise add default.
if (!("DROPPY_CACHE_SKIP_VALIDATIONS" in process.env)) {
    process.env.DROPPY_CACHE_SKIP_VALIDATIONS = true;
}

import("../lib/cli.js");
