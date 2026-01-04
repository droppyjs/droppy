import EventEmitter from "node:events";
import type { Stats } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import chokidar from "chokidar";
import escRe from "escape-string-regexp";
import debounce from "lodash.debounce";
import { type Entry, rrdirAsync } from "rrdir";
import { utils } from "../../../index.js";
import type { DroppyConfig } from "../../cfg/types.js";
import log from "../../log/index.js";
import paths from "../../paths/index.js";
import type { StorageEntry, StorageHandler } from "../types.js";

const WATCHER_DELAY = 3000;

type EntryWithStringPath = Omit<Entry, "path"> & { path: string };

function rrdirPathToString(p: Entry["path"]): string {
    return typeof p === "string" ? p : Buffer.from(p).toString("utf8");
}

export class FilesystemStorageProvider
    extends EventEmitter
    implements StorageHandler
{
    private config!: DroppyConfig;
    private watching: boolean = true;

    private lookawayTimer: NodeJS.Timeout | undefined = undefined;

    private todoDirs: string[] = [];

    private dirs: Record<
        string,
        {
            files: Record<string, StorageEntry>;
            meta: StorageEntry;
        }
    > = {};

    async init(config: DroppyConfig) {
        this.config = config;

        await this.refreshAll();

        if (this.config.watch) {
            chokidar
                .watch(paths.get().files, {
                    alwaysStat: true,
                    ignoreInitial: true,
                    usePolling: Boolean(this.config.pollingInterval),
                    interval: this.config.pollingInterval,
                    binaryInterval: this.config.pollingInterval,
                })
                .on("error", log.error)
                .on("all", () => {
                    // TODO: only update what's really necessary
                    if (this.watching) {
                        this.refreshAll();
                    }
                });
        }
    }

    async copy(source: string, destination: string) {
        let stats: Stats;

        try {
            stats = await fs.stat(utils.addFilesPath(source));
        } catch (err) {
            log.error(err);

            throw err;
        }

        this.lookAway();

        if (stats.isFile()) {
            // Copy file
            try {
                const destinationDir = path.dirname(destination);
                const destinationFile = path.basename(destination);

                const sourceDir = path.dirname(source);
                const sourceFile = path.basename(source);

                // Update filesystem
                await utils.copyFile(
                    utils.addFilesPath(source),
                    utils.addFilesPath(destination),
                );

                // Update cache
                this.dirs[destinationDir].files[destinationFile] =
                    structuredClone(this.dirs[sourceDir].files[sourceFile]);

                this.dirs[destinationDir].files[destinationFile].mtime =
                    Date.now();

                this.update(destinationDir);
            } catch (err) {
                log.error(err);
                throw err;
            }
        } else if (stats.isDirectory()) {
            // Copy directory
            try {
                // Update filesystem

                await utils.copyDir(
                    utils.addFilesPath(source),
                    utils.addFilesPath(destination),
                );

                // Update cache

                this.dirs[destination] = structuredClone(this.dirs[source]);
                this.dirs[destination].meta.mtime = Date.now();

                // Subdirs
                for (const dir of Object.keys(this.dirs)) {
                    if (
                        new RegExp(`^${escRe(source)}/`).test(dir) &&
                        dir !== source &&
                        dir !== destination
                    ) {
                        this.dirs[
                            dir.replace(
                                new RegExp(`^${escRe(source)}/`),
                                `${destination}/`,
                            )
                        ] = structuredClone(this.dirs[dir]);
                        this.dirs[
                            dir.replace(
                                new RegExp(`^${escRe(source)}/`),
                                `${destination}/`,
                            )
                        ].meta.mtime = Date.now();
                    }
                }

                this.update(path.dirname(destination));
            } catch (err) {
                log.error(err);
                throw err;
            }
        } else {
            throw new Error("Invalid file type");
        }
    }

    async move(source: string, destination: string) {
        let stats: Stats;

        try {
            stats = await fs.stat(utils.addFilesPath(source));
        } catch (err) {
            log.error(err);

            throw err;
        }

        this.lookAway();

        if (stats.isFile()) {
            // Move file
            try {
                // Update filesystem
                await utils.move(
                    utils.addFilesPath(source),
                    utils.addFilesPath(destination),
                    true,
                );

                // Update cache
                this.dirs[path.dirname(destination)].files[
                    path.basename(destination)
                ] =
                    this.dirs[path.dirname(source)].files[
                        path.basename(source)
                    ];

                delete this.dirs[path.dirname(source)].files[
                    path.basename(source)
                ];

                this.update(path.dirname(source));
                this.update(path.dirname(destination));
            } catch (err) {
                log.error(err);

                throw err;
            }
        } else if (stats.isDirectory()) {
            // Move directory

            try {
                // Update filesystem
                await utils.move(
                    utils.addFilesPath(source),
                    utils.addFilesPath(destination),
                    true,
                );

                // Update cache
                this.dirs[destination] = this.dirs[source];
                delete this.dirs[source];

                for (const dir of Object.keys(this.dirs)) {
                    if (
                        new RegExp(`^${escRe(source)}/`).test(dir) &&
                        dir !== source &&
                        dir !== destination
                    ) {
                        this.dirs[
                            dir.replace(
                                new RegExp(`^${escRe(source)}/`),
                                `${destination}/`,
                            )
                        ] = this.dirs[dir];
                        delete this.dirs[dir];
                    }
                }

                this.update(path.dirname(source));
                this.update(path.dirname(destination));
            } catch (err) {
                log.error(err);

                throw err;
            }
        } else {
            throw new Error("Invalid file type");
        }
    }

    async delete(p: string) {
        let stats: Stats;
        try {
            stats = await fs.stat(utils.addFilesPath(p));
        } catch (err) {
            log.error(err);

            throw err;
        }

        this.lookAway();

        if (stats.isFile()) {
            await fs.unlink(utils.addFilesPath(p));
            delete this.dirs[path.dirname(p)].files[path.basename(p)];
            this.update(path.dirname(p));
        } else if (stats.isDirectory()) {
            await fs.rm(utils.addFilesPath(p), { recursive: true });
            delete this.dirs[p];

            for (const d of Object.keys(this.dirs)) {
                if (new RegExp(`^${escRe(p)}/`).test(d)) {
                    delete this.dirs[d];
                }
            }
            this.update(path.dirname(p));
        } else {
            throw new Error("Invalid file type");
        }
    }

    async exists(p: string): Promise<boolean> {
        try {
            await fs.stat(utils.addFilesPath(p));
            return true;
        } catch {
            return false;
        }
    }

    async search(p: string, query: string): Promise<StorageEntry[]> {
        if (!this.dirs[p] || typeof query !== "string" || !query) {
            return [];
        }
        const files: string[] = [];
        const folders: string[] = [];
        query = query.toLowerCase();
        Object.keys(this.dirs)
            .filter((dir) => {
                return dir.indexOf(p) === 0;
            })
            .forEach((dir) => {
                if (dir.toLowerCase().includes(query) && dir !== p) {
                    folders.push(dir);
                }
                Object.keys(this.dirs[dir].files).forEach((file) => {
                    if (file.toLowerCase().includes(query)) {
                        files.push(path.posix.join(dir, file));
                    }
                });
            });
        const e = this.entries(files, folders, true, p);
        if (!Object.keys(e).length) {
            return [];
        }

        return Object.values(e);
    }

    async listDir(dir: string, filter?: RegExp): Promise<StorageEntry[]> {
        if (!this.dirs[dir]) {
            return [];
        }

        if (filter) {
            const files = Object.keys(this.dirs[dir].files)
                .filter((file) => filter.test(file))
                .map((file) => path.posix.join(dir, file));

            const folders = Object.keys(this.dirs).filter((d) => {
                return (
                    d !== dir &&
                    path.dirname(d) === dir &&
                    filter.test(path.basename(d))
                );
            });

            return Object.values(this.entries(files, folders));
        } else {
            const files = Object.keys(this.dirs[dir].files).map((file) =>
                path.posix.join(dir, file),
            );
            const folders = Object.keys(this.dirs).filter(
                (d) => d !== dir && path.dirname(d) === dir,
            );

            return Object.values(this.entries(files, folders));
        }
    }

    async makekDir(dir: string) {
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

            this.dirs[dir] = {
                files: {},
                meta: {
                    name: path.basename(dir),
                    type: "directory",
                    size: 0,
                    mtime: Date.now(),
                },
            };
            this.update(path.dirname(dir));
        }
    }

    async refreshDir(dir: string) {
        const fullDir = utils.addFilesPath(dir);

        //
        // Sanity check: does it exist?
        //

        let stats: Stats | undefined;
        try {
            stats = await fs.lstat(fullDir);
        } catch (err) {
            log.error(err);
        }

        //
        // Collect entries using rrdir
        //

        let entries: Entry[] = [];

        try {
            entries = await rrdirAsync(fullDir, {
                stats: true,
                exclude: this.config.ignorePatterns,
                followSymlinks: true,
            });
        } catch (err) {
            log.error(err);
        }

        const normalizedEntries: EntryWithStringPath[] = (entries || []).map(
            (entry) => ({
                ...entry,
                path: rrdirPathToString(entry.path),
            }),
        );

        //
        // Remove deleted dirs from cache
        //

        for (const entry of normalizedEntries) {
            if (entry.err && "code" in entry.err) {
                if (
                    entry.err.code === "ENOENT" &&
                    this.dirs[utils.removeFilesPath(entry.path)]
                ) {
                    delete this.dirs[utils.removeFilesPath(entry.path)];
                }
            }
        }

        const readDirs = normalizedEntries.filter((entry) => entry.directory);
        const readFiles = normalizedEntries.filter((entry) => !entry.directory);

        //
        // Save into cache
        //

        this.dirs[dir] = {
            files: {},
            meta: {
                name: path.basename(dir),
                type: "directory",
                size: 0,
                mtime: stats ? stats.mtime.getTime() : Date.now(),
            },
        };

        const readDirObj: Record<string, Stats | undefined> = {};
        const readDirKeys: string[] = [];

        readDirs
            .sort((a, b) => utils.naturalSort(a.path, b.path))
            .forEach((d) => {
                const path = utils.removeFilesPath(d.path).normalize();
                readDirObj[path] = d.stats;
                readDirKeys[path] = path;
            });

        // Remove deleted dirs
        Object.keys(this.dirs).forEach((path) => {
            if (
                path.indexOf(dir) === 0 &&
                readDirKeys.includes(path) &&
                path !== dir
            ) {
                delete this.dirs[path];
            }
        });

        // Add dirs
        Object.keys(readDirObj).forEach((dirPath) => {
            this.dirs[dirPath] = {
                files: {},
                meta: {
                    name: path.basename(dirPath),
                    type: "directory",
                    size: 0,
                    mtime: readDirObj[dirPath]?.mtime?.getTime() ?? 0,
                },
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
                this.dirs[parentDir].files[path.basename(f.path).normalize()] =
                    {
                        name: path.basename(f.path).normalize(),
                        type: "file",
                        size,
                        mtime,
                    };
                this.dirs[parentDir].meta.size += size;
            });

        this.update(dir);
    }

    async refreshAll() {
        this.dirs = {};
        await this.refreshDir("/");
    }

    async makeFile(p: string) {
        return this.saveFile(p, "");
    }

    async saveFile(p: string, data: string) {
        this.lookAway();

        try {
            await fs.stat(utils.addFilesPath(p));
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

        await fs.writeFile(utils.addFilesPath(p), data);

        this.dirs[path.dirname(p)].files[path.basename(p)] = {
            name: path.basename(p),
            type: "file",
            size: Buffer.byteLength(data),
            mtime: Date.now(),
        };

        this.update(path.dirname(p));
    }

    // --------------------------------------------------
    // Filesystem Specific Methods
    // --------------------------------------------------

    private lookAway() {
        this.watching = false;
        clearTimeout(this.lookawayTimer);
        this.lookawayTimer = setTimeout(() => {
            this.watching = true;
        }, WATCHER_DELAY);
    }

    private filterDirs(dirs: string[]) {
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

    private debouncedUpdate = debounce(
        () => {
            this.filterDirs(this.todoDirs).forEach((dir) => {
                this.emit("update", dir);
            });
            this.todoDirs = [];
        },
        100,
        { trailing: true },
    );

    private updateDirSizes() {
        const todo = Object.keys(this.dirs);

        todo.sort((a, b) => {
            return (
                utils.countOccurences(b, "/") - utils.countOccurences(a, "/")
            );
        });

        todo.forEach((d) => {
            this.dirs[d].meta.size = 0;
            Object.keys(this.dirs[d].files).forEach((f) => {
                this.dirs[d].meta.size += this.dirs[d].files[f].size;
            });
        });

        todo.forEach((d) => {
            if (path.dirname(d) !== "/" && this.dirs[path.dirname(d)]) {
                this.dirs[path.dirname(d)].meta.size += this.dirs[d].meta.size;
            }
        });
    }

    private update(dir: string) {
        this.updateDirSizes();
        this.todoDirs.push(dir);
        this.debouncedUpdate();
    }

    private entries(
        files: string[],
        folders: string[],
        relativePaths: boolean = false,
        base: string = "",
    ) {
        const entries: Record<string, StorageEntry> = {};

        for (const file of files) {
            const f = this.dirs[path.dirname(file)].files[path.basename(file)];
            const mtime = Math.round(f.mtime / 1e3);
            const name = relativePaths
                ? path.relative(base, file)
                : path.basename(file);
            entries[name] = {
                name,
                size: f.size,
                mtime,
                type: "file",
            };
        }

        for (const folder of folders) {
            if (this.dirs[folder]) {
                const d = this.dirs[folder];
                const mtime = Math.round(d.meta.mtime / 1e3);
                const name = relativePaths
                    ? path.relative(base, folder)
                    : path.basename(folder);
                entries[name] = {
                    name,
                    size: d.meta.size,
                    mtime,
                    type: "directory",
                };
            }
        }

        return entries;
    }
}
