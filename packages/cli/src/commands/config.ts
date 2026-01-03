import fs from 'node:fs';
import * as path from "node:path";
import { spawn } from "node:child_process";
import which from "which";

import { cfg, paths } from "@droppyjs/server";

import type { Argv, Pkg } from "../types.js";

export async function config(_pkg: Pkg, _argv: Argv) {
    const ourPaths = paths.get();
    const edit = () => {
        findEditor().then((editor) => {
            if (!editor) {
                return console.error(
                    `No suitable editor found, please edit ${ourPaths.cfgFile}`,
                );
            }
            spawn(editor, [ourPaths.cfgFile], {
                stdio: "inherit",
            });
        });
    };
    fs.stat(ourPaths.cfgFile, (err: NodeJS.ErrnoException | null) => {
        if (err?.code === "ENOENT") {
            fs.mkdir(ourPaths.config, { recursive: true }, async () => {
                try {
                    await cfg.init(null);
                    edit();
                } catch (initErr: unknown) {
                    const message =
                        initErr instanceof Error
                            ? initErr.message
                            : String(initErr);
                    console.error(new Error(message).stack);
                }
            });
        } else {
            edit();
        }
    });
}

async function findEditor() {
    const editors = ["vim", "nano", "vi", "npp", "pico", "emacs", "notepad"];
    const basename = path.basename;
    const userEditor = basename(process.env.VISUAL || process.env.EDITOR || "");

    if (userEditor && !editors.includes(userEditor)) {
        editors.unshift(userEditor);
    }

    for (const editor of editors) {
        if (!editor) {
            continue;
        }
        try {
            const editorPath = which.sync(editor);
            if (editorPath) {
                return editorPath;
            }
        } catch(error: unknown) {
            if (error instanceof Error && 'code' in error && error.code === "ENOENT") {
                continue;
            }
            throw error;
        }
    }
    return undefined;
}
