import type { DroppyConfig } from "../cfg/types.js";
import type { Database } from "./struct.js";

export type TableName = keyof Database;
export type TableRow<TTable extends TableName> = Database[TTable][string];
export type TableInputRow<TTable extends TableName> = Omit<
    TableRow<TTable>,
    "_id"
>;
export type TableWhere<TTable extends TableName> = Partial<
    TableInputRow<TTable>
>;

export interface DbHandler {
    /**
     *
     * @param config The config is only passed when loading from server, not CLI.
     */
    load(config?: DroppyConfig): Promise<void>;

    getRecord<TTable extends TableName>(
        table: TTable,
        key: string,
    ): Promise<TableRow<TTable> | null>;
    getRecordWhere<TTable extends TableName>(
        table: TTable,
        where: Partial<TableWhere<TTable>>,
    ): Promise<TableRow<TTable> | null>;
    getRecordsWhere<TTable extends TableName>(
        table: TTable,
        where: Partial<TableWhere<TTable>>,
    ): Promise<TableRow<TTable>[]>;

    addRecord<TTable extends TableName>(
        table: TTable,
        key: string,
        value: TableInputRow<TTable>,
    ): Promise<void>;
    setRecord<TTable extends TableName>(
        table: TTable,
        key: string,
        value: TableInputRow<TTable>,
    ): Promise<void>;
    setRecordsWhere<TTable extends TableName>(
        table: TTable,
        where: Partial<TableWhere<TTable>>,
        values: Partial<TableInputRow<TTable>>,
    ): Promise<void>;
    addOrUpdateRecord<TTable extends TableName>(
        table: TTable,
        key: string,
        value: TableInputRow<TTable>,
    ): Promise<void>;

    deleteRecord<TTable extends TableName>(
        table: TTable,
        key: string,
    ): Promise<number>;
    deleteRecordsWhere<TTable extends TableName>(
        table: TTable,
        where: Partial<TableWhere<TTable>>,
    ): Promise<number>;
    deleteAllRecords<TTable extends TableName>(table: TTable): Promise<number>;

    countRecords<TTable extends TableName>(
        table: TTable,
        where?: Partial<TableWhere<TTable>>,
    ): Promise<number>;
}
