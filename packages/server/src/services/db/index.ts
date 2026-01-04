import { DbJson } from "./impl/db-json.js";
import type { DbHandler } from "./types.js";

const db = new DbJson() as DbHandler;

export default db;
