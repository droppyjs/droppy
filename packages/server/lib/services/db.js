"use strict";

import chokidar from "chokidar";
import fs from "fs";
import crypto from "crypto";
import path from "path";

import { log, paths } from "../index.js";

const defaults = { users: {}, sessions: {}, links: {}, apiKeys: {} };

let database, watching;

// API Key ID length (8 bytes = 16 hex chars)
const KEY_ID_LENGTH = 8;
// API Key length (32 bytes = 64 hex chars)
const KEY_LENGTH = 32;

class DroppyDb {
  load(callback) {
    const dbFile = paths.get().db;
    fs.stat(dbFile, (err) => {
      if (err) {
        if (err.code === "ENOENT") {
          database = defaults;
          fs.mkdir(path.dirname(dbFile), { recursive: true }, (err) => {
            if (err) return callback(err);
            write();
            callback();
          });
        } else {
          callback(err);
        }
      } else {
        this.parse((err) => {
          if (err) return callback(err);
          let modified = false;

          // migrate old shortlinks
          if (database.shortlinks) {
            modified = true;
            database.sharelinks = database.shortlinks;
            delete database.shortlinks;
          }
          if (database.sharelinks) {
            modified = true;
            database.links = {};
            Object.keys(database.sharelinks).forEach((hash) => {
              database.links[hash] = {
                location: database.sharelinks[hash],
                attachment: false,
              };
            });
            delete database.sharelinks;
          }

          if (database.sessions) {
            Object.keys(database.sessions).forEach((session) => {
              // invalidate session not containing a username
              if (!database.sessions[session].username) {
                modified = true;
                delete database.sessions[session];
              }
              // invalidate pre-1.7 session tokens
              if (session.length !== 48) {
                modified = true;
                delete database.sessions[session];
              }
            });
          }

          // remove unused values
          if (database.version) {
            modified = true;
            delete database.version;
          }

          if (modified) write();
          callback();
        });
      }
    });
  }

  parse(cb) {
    const dbFile = paths.get().db;
    fs.readFile(dbFile, "utf8", (err, data) => {
      if (err) return cb(err);

      if (data.trim() !== "") {
        try {
          database = JSON.parse(data);
        } catch (err2) {
          return cb(err2);
        }
      } else {
        database = {};
      }
      database = Object.assign({}, defaults, database);
      cb();
    });
  }

  get(key) {
    return database[key];
  }

  set(key, value) {
    database[key] = value;
    write();
  }

  addOrUpdateUser(user, password, privileged) {
    const salt = crypto.randomBytes(4).toString("hex");

    database.users[user] = {
      hash: `${getHash(password + salt + user)}$${salt}`,
      privileged,
    };

    write();
  }

  delUser(user) {
    if (database.users[user]) {
      // delete user
      delete database.users[user];

      // delete user sessions
      Object.keys(database.sessions).forEach((sid) => {
        if (database.sessions[sid].username === user) {
          delete database.sessions[sid];
        }
      });

      write();
      return true;
    } else {
      return false;
    }
  }

  authUser(user, pass) {
    let parts;

    if (database.users[user]) {
      parts = database.users[user].hash.split("$");
      if (parts.length === 2 && parts[0] === getHash(pass + parts[1] + user)) {
        return true;
      }
    }

    return false;
  }

  watch(config) {
    const dbFile = paths.get().db;
    chokidar
      .watch(dbFile, {
        ignoreInitial: true,
        usePolling: Boolean(config.pollingInterval),
        interval: config.pollingInterval,
        binaryInterval: config.pollingInterval,
      })
      .on("error", log.error)
      .on("change", () => {
        if (!watching) return;
        this.parse((err) => {
          if (err) return log.error(err);
          log.info("db.json reloaded because it was changed");
        });
      })
      .on("ready", () => {
        watching = true;
      });
  }

  // ===== API Key Management =====

  // Valid permission scopes
  static PERMISSIONS = ["read", "write", "delete", "admin"];

  /**
   * Generate a new API key for a user
   * @param {string} username - The username to generate the key for
   * @param {string} name - A user-friendly name/label for the key
   * @param {Object} options - Optional settings
   * @param {string[]} options.permissions - Array of permissions: "read", "write", "delete", "admin"
   * @param {number} options.expiresIn - Expiration time in milliseconds from now (0 = no expiration)
   * @returns {{ keyId: string, rawKey: string }} - The key ID and raw key (show once!)
   */
  generateApiKey(username, name = "Unnamed Key", options = {}) {
    if (!database.apiKeys) {
      database.apiKeys = {};
    }

    const keyId = crypto.randomBytes(KEY_ID_LENGTH).toString("hex");
    const rawKey = crypto.randomBytes(KEY_LENGTH).toString("hex");
    const keyHash = getHash(rawKey);

    // Validate and set permissions (default to all permissions)
    let permissions = options.permissions;
    if (!Array.isArray(permissions) || permissions.length === 0) {
      permissions = ["read", "write", "delete"];
    } else {
      // Filter to only valid permissions
      permissions = permissions.filter(p => DroppyDb.PERMISSIONS.includes(p));
      if (permissions.length === 0) {
        permissions = ["read"];
      }
    }

    // Calculate expiration timestamp
    let expiresAt = null;
    if (options.expiresIn && typeof options.expiresIn === "number" && options.expiresIn > 0) {
      expiresAt = Date.now() + options.expiresIn;
    }

    database.apiKeys[keyId] = {
      hash: keyHash,
      username,
      name,
      permissions,
      createdAt: Date.now(),
      expiresAt,
      lastUsedAt: null,
    };

    write();

    return { keyId, rawKey, permissions, expiresAt };
  }

  /**
   * Validate an API key and return the associated user info
   * @param {string} rawKey - The raw API key to validate
   * @returns {{ username: string, keyId: string, permissions: string[] } | null}
   */
  validateApiKey(rawKey) {
    if (!rawKey || !database.apiKeys) {
      return null;
    }

    const keyHash = getHash(rawKey);

    for (const [keyId, keyData] of Object.entries(database.apiKeys)) {
      if (keyData.hash === keyHash) {
        // Check if key has expired
        if (keyData.expiresAt && Date.now() > keyData.expiresAt) {
          return null;
        }

        return {
          username: keyData.username,
          keyId,
          permissions: keyData.permissions || ["read", "write", "delete"],
        };
      }
    }

    return null;
  }

  /**
   * List all API keys for a user (without exposing hashes)
   * @param {string} username - The username to list keys for
   * @returns {Array<{ keyId: string, name: string, createdAt: number, lastUsedAt: number | null }>}
   */
  listApiKeys(username) {
    if (!database.apiKeys) {
      return [];
    }

    const now = Date.now();
    const keys = [];
    for (const [keyId, keyData] of Object.entries(database.apiKeys)) {
      if (keyData.username === username) {
        const isExpired = keyData.expiresAt ? now > keyData.expiresAt : false;
        keys.push({
          keyId,
          name: keyData.name,
          permissions: keyData.permissions || ["read", "write", "delete"],
          createdAt: keyData.createdAt,
          expiresAt: keyData.expiresAt,
          expired: isExpired,
          lastUsedAt: keyData.lastUsedAt,
        });
      }
    }

    return keys.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Revoke an API key
   * @param {string} keyId - The key ID to revoke
   * @param {string} username - The username (for authorization check)
   * @returns {boolean} - True if revoked, false if not found or unauthorized
   */
  revokeApiKey(keyId, username) {
    if (!database.apiKeys || !database.apiKeys[keyId]) {
      return false;
    }

    // Only allow revoking own keys (or privileged users could revoke any)
    if (database.apiKeys[keyId].username !== username) {
      // Check if user is privileged
      const user = database.users[username];
      if (!user || !user.privileged) {
        return false;
      }
    }

    delete database.apiKeys[keyId];
    write();
    return true;
  }

  /**
   * Update the lastUsedAt timestamp for an API key
   * @param {string} keyId - The key ID to update
   */
  updateApiKeyLastUsed(keyId) {
    if (database.apiKeys && database.apiKeys[keyId]) {
      database.apiKeys[keyId].lastUsedAt = Date.now();
      // Don't write to disk on every request - too expensive
      // The value will be persisted on next write() call
    }
  }
}

// TODO: async
function write() {
  const dbFile = paths.get().db;
  watching = false;
  fs.writeFileSync(dbFile, JSON.stringify(database, null, 2));

  // watch the file 1 second after last write
  setTimeout(() => {
    watching = true;
  }, 1000);
}

function getHash(string) {
  return crypto.createHmac("sha256", string).digest("hex");
}

export default new DroppyDb();
