#!/usr/bin/env node

if (process.versions.node < "20.0.0") {
    console.error("Node.js version 20 or higher is required");
    process.exit(1);
}

import { existsSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";

import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.setSourceMapsEnabled(true);

// Check for DROPPY_CACHE_PATH, otherwise add default.
if (!("DROPPY_CACHE_PATH" in process.env)) {
    try {
        const cachePath = realpathSync(
            join(__dirname, "..", "dist", "cache.json"),
        );
        if (existsSync(cachePath)) {
            process.env.DROPPY_CACHE_PATH = cachePath;
        }
    } catch (error) {
        if (
            error instanceof Error &&
            "code" in error &&
            error.code === "ENOENT"
        ) {
            // ignore, no cache found, it will be created on first use
        } else {
            console.error(error);
            process.exit(1);
        }
    }
}

// Check for DROPPY_CACHE_SKIP_VALIDATIONS, otherwise add default.
if (!("DROPPY_CACHE_SKIP_VALIDATIONS" in process.env)) {
    process.env.DROPPY_CACHE_SKIP_VALIDATIONS = true;
}

import("../dist/cli.js");
