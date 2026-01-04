import type EventEmitter from "node:events";
import type { DroppyConfig } from "../cfg/types.js";

export type StorageEntry = {
    name: string;
    size: number;
    mtime: number;
    type: "file" | "directory";
};

/**
 * StorageHandler interface
 *
 * It expects a few events to be emitted:
 * - updateall: when the entire storage should be refreshed
 * - update(dir): when a specific directory should be refreshed
 */
export interface StorageHandler extends EventEmitter {
    init(config: DroppyConfig): Promise<void>;

    // --------------------------------------------------
    // Hybrid Operations
    // --------------------------------------------------

    /**
     * Copy a file or directory from one location to another.
     * @param source Source path
     * @param destination Destination path
     */
    copy(source: string, destination: string): Promise<void>;

    /**
     * Move a file or directory from one location to another.
     * @param source Source path
     * @param destination Destination path
     */
    move(source: string, destination: string): Promise<void>;

    /**
     * Delete a file or directory.
     * @param path Path to the file or directory
     */
    delete(path: string): Promise<void>;

    /**
     * Search for a file or directory.
     * @param path Path to the directory to search in
     * @param query Search query
     */
    search(path: string, query: string): Promise<StorageEntry[]>;

    /**
     * Check if a file or directory exists.
     * @param path Path to the file or directory
     */
    exists(path: string): Promise<boolean>;

    // --------------------------------------------------
    // Folder Operations
    // --------------------------------------------------

    /**
     * List the contents of a directory.
     * @param dir Path to the directory to list
     * @param filter Optional filter to apply to the list
     */
    listDir(dir: string, filter?: RegExp): Promise<StorageEntry[]>;

    /**
     * Make a new directory.
     * @param dir Path to the directory to make
     */
    makekDir(dir: string): Promise<void>;

    /**
     * Refresh the cache for a directory.
     * @param dir Path to the directory to refresh
     */
    refreshDir(dir: string): Promise<void>;

    refreshAll(): Promise<void>;

    // --------------------------------------------------
    // File Operations
    // --------------------------------------------------

    /**
     * Make a new file.
     * @param path Path to the file to make
     */
    makeFile(path: string): Promise<void>;

    /**
     * Save data to a file.
     * @param path Path to the file to save
     * @param data Data to save
     */
    saveFile(path: string, data: string): Promise<void>;
}
