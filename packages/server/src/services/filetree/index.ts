import { EventEmitter } from "node:events";
import type { Stats } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import chokidar from "chokidar";
import escRe from "escape-string-regexp";
import debounce from "lodash.debounce";
import rfdc from "rfdc";
import { type Entry, rrdirAsync } from "rrdir";
import { utils } from "../../utils/index.js";
import type { DroppyConfig } from "../cfg/types.js";
import log from "../log/index.js";
import paths from "../paths/index.js";

const clone = rfdc();

let dirs = {};
let todoDirs: string[] = [];
let initial = true;
let watching = true;
let timer: any = null;
let cfg: DroppyConfig;

const WATCHER_DELAY = 3000;

type EntryWithStringPath = Omit<Entry, "path"> & { path: string };

function rrdirPathToString(p: Entry["path"]): string {
    return typeof p === "string" ? p : Buffer.from(p).toString("utf8");
}

class DroppyFileTree extends EventEmitter {
    init(config: DroppyConfig) {
        cfg = config;
    }

    watch() {
        chokidar
            .watch(paths.get().files, {
                alwaysStat: true,
                ignoreInitial: true,
                usePolling: Boolean(cfg.pollingInterval),
                interval: cfg.pollingInterval,
                binaryInterval: cfg.pollingInterval,
            })
            .on("error", log.error)
            .on("all", () => {
                // TODO: only update what's really necessary
                if (watching) this.updateAll();
            });
    }

    updateAll() {
        debounce(async () => {
            log.debug("Updating file tree because of local filesystem changes");
            await this.updateDir(null);
            this.emit("updateall");
        })();
    }

    async updateDir(dir: string | null = null) {
        if (dir === null) {
            dir = "/";
            dirs = {};
        }

        const fullDir = utils.addFilesPath(dir);

        let stats: Stats | undefined;
        try {
            stats = await fs.lstat(fullDir);
        } catch (err) {
            log.error(err);
        }

        let entries: Entry[] = [];
        if (initial) {
            // sync walk for performance
            initial = false;
            try {
                entries = await rrdirAsync(fullDir, {
                    stats: true,
                    exclude: cfg.ignorePatterns,
                    followSymlinks: true,
                });
            } catch (err) {
                log.error(err);
            }
        } else {
            try {
                entries = await rrdirAsync(fullDir, {
                    stats: true,
                    exclude: cfg.ignorePatterns,
                    followSymlinks: true,
                });
            } catch (err) {
                log.error(err);
            }
        }

        const normalizedEntries: EntryWithStringPath[] = (entries || []).map(
            (entry) => ({
                ...entry,
                path: rrdirPathToString(entry.path),
            }),
        );

        for (const entry of normalizedEntries) {
            if (entry.err && "code" in entry.err) {
                if (
                    entry.err.code === "ENOENT" &&
                    dirs[utils.removeFilesPath(entry.path)]
                ) {
                    delete dirs[utils.removeFilesPath(entry.path)];
                }
            }
        }

        const readDirs = normalizedEntries.filter((entry) => entry.directory);
        const readFiles = normalizedEntries.filter((entry) => !entry.directory);

        this.updateDirInCache(dir, stats, readDirs, readFiles);
    }

    async del(dir: string) {
        let stats: Stats;
        try {
            stats = await fs.stat(utils.addFilesPath(dir));
        } catch (err) {
            log.error(err);

            throw err;
        }

        if (stats.isFile()) {
            await this.unlink(dir);
        } else if (stats.isDirectory()) {
            await this.unlinkdir(dir);
        } else {
            throw new Error("Invalid file type");
        }
    }

    unlink(dir: string) {
        this.lookAway();

        // TODO: remove new promise, change to async when utils.rm is async
        return new Promise<void>((resolve, reject) => {
            fs.unlink(utils.addFilesPath(dir))
                .then(() => {
                    delete dirs[path.dirname(dir)].files[path.basename(dir)];
                    this.update(path.dirname(dir));
                    resolve();
                })
                .catch((err) => {
                    log.error(err);
                    reject(err);
                });
        });
    }

    unlinkdir(dir: string) {
        this.lookAway();

        // TODO: remove new promise, change to async when utils.rmdir is async
        return new Promise<void>((resolve, reject) => {
            fs.rm(utils.addFilesPath(dir), { recursive: true })
                .then(() => {
                    delete dirs[dir];
                    Object.keys(dirs).forEach((d) => {
                        if (new RegExp(`^${escRe(dir)}/`).test(d)) {
                            delete dirs[d];
                        }
                    });
                    this.update(path.dirname(dir));
                    resolve();
                })
                .catch((err) => {
                    log.error(err);
                    reject(err);
                });
        });
    }

    async clipboard(src: string, dst: string, type: "cut" | "copy") {
        let stats: Stats;

        try {
            stats = await fs.stat(utils.addFilesPath(src));
        } catch (err) {
            log.error(err);

            throw err;
        }

        this.lookAway();

        if (stats.isFile()) {
            if (type === "cut") {
                return await this.mv(src, dst);
            } else {
                return await this.cp(src, dst);
            }
        } else if (stats.isDirectory()) {
            if (type === "cut") {
                return await this.mvdir(src, dst);
            } else {
                return await this.cpdir(src, dst);
            }
        } else {
            throw new Error("Invalid file type");
        }
    }

    async mk(dir: string) {
        this.lookAway();

        try {
            await fs.stat(utils.addFilesPath(dir));
        } catch (err) {
            if (
                err instanceof Error &&
                "code" in err &&
                err.code === "ENOENT"
            ) {
                const fd = await fs.open(utils.addFilesPath(dir), "wx");

                await fd.close();

                dirs[path.dirname(dir)].files[path.basename(dir)] = {
                    size: 0,
                    mtime: Date.now(),
                };

                this.update(path.dirname(dir));
            } else {
                log.error(err);

                throw err;
            }
        }
    }

    async mkdir(dir: string) {
        this.lookAway();

        try {
            await fs.stat(utils.addFilesPath(dir));
        } catch (err) {
            if (
                err instanceof Error &&
                "code" in err &&
                err.code !== "ENOENT"
            ) {
                log.error(err);
                throw err;
            }

            await utils.mkdir(utils.addFilesPath(dir));

            dirs[dir] = { files: {}, size: 0, mtime: Date.now() };
            this.update(path.dirname(dir));
        }
    }

    async move(src: string, dst: string) {
        this.lookAway();

        try {
            const stats = await fs.stat(utils.addFilesPath(src));

            if (stats.isFile()) {
                await this.mv(src, dst);
            } else if (stats.isDirectory()) {
                await this.mvdir(src, dst);
            }
        } catch (err) {
            log.error(err);

            throw err;
        }
    }

    async mv(src: string, dst: string) {
        this.lookAway();

        try {
            await utils.move(
                utils.addFilesPath(src),
                utils.addFilesPath(dst),
                true,
            );

            dirs[path.dirname(dst)].files[path.basename(dst)] =
                dirs[path.dirname(src)].files[path.basename(src)];

            delete dirs[path.dirname(src)].files[path.basename(src)];

            this.update(path.dirname(src));
            this.update(path.dirname(dst));
        } catch (err) {
            log.error(err);

            throw err;
        }
    }

    async mvdir(src: string, dst: string) {
        this.lookAway();

        try {
            await utils.move(
                utils.addFilesPath(src),
                utils.addFilesPath(dst),
                true,
            );

            dirs[dst] = dirs[src];
            delete dirs[src];

            Object.keys(dirs).forEach((dir) => {
                if (
                    new RegExp(`^${escRe(src)}/`).test(dir) &&
                    dir !== src &&
                    dir !== dst
                ) {
                    dirs[
                        dir.replace(new RegExp(`^${escRe(src)}/`), `${dst}/`)
                    ] = dirs[dir];
                    delete dirs[dir];
                }
            });

            this.update(path.dirname(src));
            this.update(path.dirname(dst));
        } catch (err) {
            log.error(err);

            throw err;
        }
    }

    async cp(src: string, dst: string) {
        this.lookAway();

        try {
            await utils.copyFile(
                utils.addFilesPath(src),
                utils.addFilesPath(dst),
            );

            dirs[path.dirname(dst)].files[path.basename(dst)] = clone(
                dirs[path.dirname(src)].files[path.basename(src)],
            );

            dirs[path.dirname(dst)].files[path.basename(dst)].mtime =
                Date.now();

            this.update(path.dirname(dst));
        } catch (err) {
            log.error(err);

            throw err;
        }
    }

    async cpdir(src: string, dst: string) {
        this.lookAway();
        await utils.copyDir(utils.addFilesPath(src), utils.addFilesPath(dst));

        // Basedir
        dirs[dst] = clone(dirs[src]);
        dirs[dst].mtime = Date.now();

        // Subdirs
        Object.keys(dirs).forEach((dir) => {
            if (
                new RegExp(`^${escRe(src)}/`).test(dir) &&
                dir !== src &&
                dir !== dst
            ) {
                dirs[dir.replace(new RegExp(`^${escRe(src)}/`), `${dst}/`)] =
                    clone(dirs[dir]);
                dirs[
                    dir.replace(new RegExp(`^${escRe(src)}/`), `${dst}/`)
                ].mtime = Date.now();
            }
        });

        this.update(path.dirname(dst));
    }

    async save(dst: string, data: string) {
        this.lookAway();
        try {
            await fs.stat(utils.addFilesPath(dst));
        } catch (err) {
            if (
                err instanceof Error &&
                "code" in err &&
                err.code !== "ENOENT"
            ) {
                log.error(err);
                throw err;
            }
        }

        await fs.writeFile(utils.addFilesPath(dst), data);

        dirs[path.dirname(dst)].files[path.basename(dst)] = {
            size: Buffer.byteLength(data),
            mtime: Date.now(),
        };

        this.update(path.dirname(dst));
    }

    search(query: string, p: string) {
        if (!dirs[p] || typeof query !== "string" || !query) return null;
        const files: string[] = [];
        const folders: string[] = [];
        query = query.toLowerCase();
        Object.keys(dirs)
            .filter((dir) => {
                return dir.indexOf(p) === 0;
            })
            .forEach((dir) => {
                if (dir.toLowerCase().includes(query) && dir !== p) {
                    folders.push(dir);
                }
                Object.keys(dirs[dir].files).forEach((file) => {
                    if (file.toLowerCase().includes(query)) {
                        files.push(path.posix.join(dir, file));
                    }
                });
            });
        const e = this.entries(files, folders, true, p);
        if (!Object.keys(e).length) return null;
        return e;
    }

    ls(p: string) {
        if (!dirs[p]) return;
        const files = Object.keys(dirs[p].files).map((file) => {
            return path.posix.join(p, file);
        });
        const folders: string[] = [];
        Object.keys(dirs).forEach((dir) => {
            if (path.dirname(dir) === p && path.basename(dir)) {
                folders.push(dir);
            }
        });
        return this.entries(files, folders);
    }

    lsFilter(p: string, re: RegExp) {
        if (!dirs[p]) {
            return;
        }
        return Object.keys(dirs[p].files).filter((file) => {
            return re.test(file);
        });
    }

    // TODO: update references from here

    debouncedUpdate = debounce(
        () => {
            this.filterDirs(todoDirs).forEach((dir) => {
                this.emit("update", dir);
            });
            todoDirs = [];
        },
        100,
        { trailing: true },
    );

    update(dir: string) {
        this.updateDirSizes();
        todoDirs.push(dir);
        this.debouncedUpdate();
    }

    lookAway() {
        watching = false;
        clearTimeout(timer);
        timer = setTimeout(() => {
            watching = true;
        }, WATCHER_DELAY);
    }

    filterDirs(dirs) {
        return dirs
            .sort((a, b) => {
                return (
                    utils.countOccurences(a, "/") -
                    utils.countOccurences(b, "/")
                );
            })
            .filter((path, _, self) => {
                return self.every((another) => {
                    return (
                        another === path || path.indexOf(`${another}/`) !== 0
                    );
                });
            })
            .filter((path, index, self) => {
                return self.indexOf(path) === index;
            });
    }

    updateDirInCache(
        root: string,
        stat: Stats | undefined,
        readDirs: EntryWithStringPath[],
        readFiles: EntryWithStringPath[],
    ) {
        dirs[root] = {
            files: {},
            size: 0,
            mtime: stat ? stat.mtime.getTime() : Date.now(),
        };

        const readDirObj = {};
        const readDirKeys: string[] = [];

        readDirs
            .sort((a, b) => utils.naturalSort(a.path, b.path))
            .forEach((d) => {
                const path = utils.removeFilesPath(d.path).normalize();
                readDirObj[path] = d.stats;
                readDirKeys[path] = path;
            });

        // Remove deleted dirs
        Object.keys(dirs).forEach((path) => {
            if (
                path.indexOf(root) === 0 &&
                readDirKeys.includes(path) &&
                path !== root
            ) {
                delete dirs[path];
            }
        });

        // Add dirs
        Object.keys(readDirObj).forEach((path) => {
            dirs[path] = {
                files: {},
                size: 0,
                mtime: readDirObj[path].mtime.getTime() || 0,
            };
        });

        // Add files
        readFiles
            .sort((a, b) => {
                return utils.naturalSort(a.path, b.path);
            })
            .forEach((f) => {
                const parentDir = utils
                    .removeFilesPath(path.dirname(f.path))
                    .normalize();
                const size = f.stats?.size ? f.stats.size : 0;
                const mtime = f.stats?.mtime?.getTime
                    ? f.stats.mtime.getTime()
                    : 0;
                dirs[parentDir].files[path.basename(f.path).normalize()] = {
                    size,
                    mtime,
                };
                dirs[parentDir].size += size;
            });

        this.update(root);
    }

    updateDirSizes() {
        const todo = Object.keys(dirs);

        todo.sort((a, b) => {
            return (
                utils.countOccurences(b, "/") - utils.countOccurences(a, "/")
            );
        });

        todo.forEach((d) => {
            dirs[d].size = 0;
            Object.keys(dirs[d].files).forEach((f) => {
                dirs[d].size += dirs[d].files[f].size;
            });
        });

        todo.forEach((d) => {
            if (path.dirname(d) !== "/" && dirs[path.dirname(d)]) {
                dirs[path.dirname(d)].size += dirs[d].size;
            }
        });
    }

    entries(
        files: string[],
        folders: string[],
        relativePaths: boolean = false,
        base: string = "",
    ) {
        const entries: Record<string, string> = {};
        files.forEach((file) => {
            const f = dirs[path.dirname(file)].files[path.basename(file)];
            const mtime = Math.round(f.mtime / 1e3);
            const name = relativePaths
                ? path.relative(base, file)
                : path.basename(file);
            entries[name] = ["f", mtime, f.size].join("|");
        });

        folders.forEach((folder) => {
            if (dirs[folder]) {
                const d = dirs[folder];
                const mtime = Math.round(d.mtime / 1e3);
                const name = relativePaths
                    ? path.relative(base, folder)
                    : path.basename(folder);
                entries[name] = ["d", mtime, d.size].join("|");
            }
        });
        return entries;
    }
}

export default new DroppyFileTree();
