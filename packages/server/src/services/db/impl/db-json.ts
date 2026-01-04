import fs from "node:fs/promises";
import path from "node:path";
import chokidar from "chokidar";
import { log } from "../../../index.js";
import type { DroppyConfig } from "../../cfg/types.js";
import paths from "../../paths.js";
import type {
    DbHandler,
    TableInputRow,
    TableName,
    TableRow,
    TableWhere,
} from "../types.js";

const defaults = { users: {}, sessions: {}, links: {} };

export class DbJson implements DbHandler {
    async getRecord<TTable extends TableName>(
        table: TTable,
        key: string,
    ): Promise<TableRow<TTable> | null> {
        const record = this.database?.[table]?.[key];
        if (!record) {
            return null;
        }
        return { _id: key, ...record } as TableRow<TTable>;
    }
    async getRecordWhere<TTable extends TableName>(
        table: TTable,
        where: TableWhere<TTable>,
    ): Promise<TableRow<TTable> | null> {
        const tableData = this.database?.[table];
        if (!tableData) {
            return null;
        }

        for (const [id, record] of Object.entries(tableData)) {
            if (Object.keys(where).every((key) => record[key] === where[key])) {
                return { _id: id, ...record } as TableRow<TTable>;
            }
        }

        return null;
    }

    async getRecordsWhere<TTable extends TableName>(
        table: TTable,
        where: TableWhere<TTable>,
    ): Promise<TableRow<TTable>[]> {
        const tableData = this.database?.[table];
        if (!tableData) {
            return [];
        }

        const results: TableRow<TTable>[] = [];
        for (const [id, record] of Object.entries(tableData)) {
            if (Object.keys(where).every((key) => record[key] === where[key])) {
                results.push({ _id: id, ...record } as TableRow<TTable>);
            }
        }

        return results;
    }

    async addRecord<TTable extends TableName>(
        table: TTable,
        key: string,
        value: TableInputRow<TTable>,
    ): Promise<void> {
        this.database[table] = {
            ...(this.database[table] ?? {}),
            [key]: value,
        };
        return this.write();
    }

    async setRecord<TTable extends TableName>(
        table: TTable,
        key: string,
        value: TableInputRow<TTable>,
    ): Promise<void> {
        this.database[table] = {
            ...this.database[table],
            [key]: value,
        };
        return this.write();
    }
    async setRecordsWhere<TTable extends TableName>(
        table: TTable,
        where: TableWhere<TTable>,
        values: Partial<TableInputRow<TTable>>,
    ): Promise<void> {
        const tableData = this.database[table] ?? {};
        for (const [id, record] of Object.entries(tableData)) {
            if (Object.keys(where).every((key) => record[key] === where[key])) {
                tableData[id] = {
                    ...record,
                    ...values,
                };
            }
        }
        this.database[table] = tableData;
        return this.write();
    }
    async addOrUpdateRecord<TTable extends TableName>(
        table: TTable,
        key: string,
        value: TableInputRow<TTable>,
    ): Promise<void> {
        if (this.database[table]?.[key]) {
            await this.setRecord(table, key, value);
        } else {
            await this.addRecord(table, key, value);
        }
    }
    async deleteRecord<TTable extends TableName>(
        table: TTable,
        key: string,
    ): Promise<number> {
        delete this.database[table]?.[key];
        this.write();
        return 1;
    }

    async deleteRecordsWhere<TTable extends TableName>(
        table: TTable,
        where: TableWhere<TTable>,
    ): Promise<number> {
        const tableData = this.database?.[table];
        if (!tableData) {
            return 0;
        }

        let deleted = 0;
        for (const [id, record] of Object.entries(tableData)) {
            if (Object.keys(where).every((key) => record[key] === where[key])) {
                delete tableData[id];
                deleted++;
            }
        }

        this.database[table] = tableData;
        await this.write();
        return deleted;
    }
    async deleteAllRecords<TTable extends TableName>(
        table: TTable,
    ): Promise<number> {
        this.database[table] = {};
        await this.write();
        return 0;
    }
    async countRecords<TTable extends TableName>(
        table: TTable,
        where?: TableWhere<TTable>,
    ): Promise<number> {
        if (where) {
            return (await this.getRecordsWhere(table, where)).length;
        }
        return Object.keys(this.database[table] ?? {}).length;
    }

    private database: Record<string, Record<string, any>> = {};
    private watching: boolean = false;

    async load(config?: DroppyConfig) {
        const dbFile = paths.get().db;

        try {
            await fs.stat(dbFile);
        } catch (err) {
            if (
                err instanceof Error &&
                "code" in err &&
                err.code === "ENOENT"
            ) {
                this.database = defaults;
                await fs.mkdir(path.dirname(dbFile), { recursive: true });

                this.write();
            } else {
                throw err;
            }
        }

        await this.parse();

        // START: MIGRATIONS

        let modified = false;

        // migrate old shortlinks
        if (this.database.shortlinks) {
            modified = true;
            this.database.sharelinks = this.database.shortlinks;
            delete this.database.shortlinks;
        }
        if (this.database.sharelinks) {
            modified = true;
            this.database.links = {};
            Object.keys(this.database.sharelinks).forEach((hash) => {
                this.database.links[hash] = {
                    location: this.database.sharelinks[hash],
                    attachment: false,
                };
            });
            delete this.database.sharelinks;
        }

        if (this.database.sessions) {
            Object.keys(this.database.sessions).forEach((session) => {
                // invalidate session not containing a username
                if (!this.database.sessions[session].username) {
                    modified = true;
                    delete this.database.sessions[session];
                }
                // invalidate pre-1.7 session tokens
                if (session.length !== 48) {
                    modified = true;
                    delete this.database.sessions[session];
                }
            });
        }

        // remove unused values
        if (this.database.version) {
            modified = true;
            delete this.database.version;
        }

        // convert attachement and attachment to isAttachnment
        // legacy codebase had spelling mistake in FE, and db field was not explicit
        if (this.database.links) {
            Object.keys(this.database.links).forEach((link) => {
                if (
                    "attachement" in this.database.links[link] ||
                    "attachment" in this.database.links[link]
                ) {
                    if (
                        this.database.links[link].attachement ||
                        this.database.links[link].attachment
                    ) {
                        this.database.links[link].isAttachment = true;
                    } else {
                        this.database.links[link].isAttachment = false;
                    }

                    delete this.database.links[link].attachement;
                    delete this.database.links[link].attachment;

                    modified = true;
                }
            });
        }

        if (modified) {
            this.write();
        }
        // END: MIGRATIONS

        if (config) {
            this.watch(config);
        }
    }

    // --------------------------------------------------
    // JSON DB HANDLING
    // --------------------------------------------------

    private async parse() {
        const dbFile = paths.get().db;

        const data = await fs.readFile(dbFile, "utf8");

        if (data.trim() !== "") {
            this.database = JSON.parse(data);
        } else {
            this.database = {};
        }
        this.database = Object.assign({}, defaults, this.database);
    }

    private async write() {
        const dbFile = paths.get().db;

        this.watching = false;

        await fs.writeFile(dbFile, JSON.stringify(this.database, null, 2));

        // watch the file 1 second after last write
        setTimeout(() => {
            this.watching = true;
        }, 1000);
    }

    private watch(config: DroppyConfig) {
        const dbFile = paths.get().db;
        chokidar
            .watch(dbFile, {
                ignoreInitial: true,
                usePolling: Boolean(config.pollingInterval),
                interval: config.pollingInterval,
                binaryInterval: config.pollingInterval,
            })
            .on("error", log.error)
            .on("change", async () => {
                if (!this.watching) {
                    return;
                }
                try {
                    await this.parse();
                } catch (err) {
                    return log.error(err);
                }

                log.info("db.json reloaded because it was changed");
            })
            .on("ready", () => {
                this.watching = true;
            });
    }
}
