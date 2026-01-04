import { FilesystemStorageProvider } from "./provider/storage-filesystem.js";
import type { StorageHandler } from "./types.js";

const storage = new FilesystemStorageProvider() as StorageHandler;

export default storage;
