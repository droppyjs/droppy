#!/usr/bin/env node

"use strict";

import https from "https";
import http from "http";

const API_PREFIX = "/api/";

class RemoteClient {
  constructor(baseUrl, username = null, password = null, apiKey = null) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.username = username;
    this.password = password;
    this.apiKey = apiKey;
  }

  _getAuthHeader() {
    // Prefer API key if provided
    if (this.apiKey) {
      return {
        Authorization: `Bearer ${this.apiKey}`,
      };
    }

    if (!this.username || !this.password) {
      return {};
    }
    const credentials = Buffer.from(`${this.username}:${this.password}`).toString("base64");
    return {
      Authorization: `Basic ${credentials}`,
    };
  }

  _makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const isHttps = url.protocol === "https:";
      const client = isHttps ? https : http;

      const options = {
        method,
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        headers: {
          "Content-Type": "application/json",
          ...this._getAuthHeader(),
        },
      };

      if (body) {
        const bodyStr = JSON.stringify(body);
        options.headers["Content-Length"] = Buffer.byteLength(bodyStr);
      }

      const req = client.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          let jsonData;
          try {
            jsonData = data ? JSON.parse(data) : null;
          } catch {
            jsonData = data;
          }

          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: jsonData });
          } else {
            const errorMsg = jsonData?.error || `HTTP ${res.statusCode}`;
            const error = new Error(errorMsg);
            error.statusCode = res.statusCode;
            reject(error);
          }
        });
      });

      req.on("error", (err) => {
        reject(err);
      });

      if (body) {
        req.write(JSON.stringify(body));
      }

      req.end();
    });
  }

  async ping() {
    return this._makeRequest("GET", `${API_PREFIX}ping`);
  }

  async list(path = "/") {
    const encodedPath = encodeURIComponent(path);
    return this._makeRequest("GET", `${API_PREFIX}list?path=${encodedPath}`);
  }

  async read(path) {
    const encodedPath = encodeURIComponent(path);
    return this._makeRequest("GET", `${API_PREFIX}read?path=${encodedPath}`);
  }

  async write(path, content, encoding = "utf8") {
    return this._makeRequest("POST", `${API_PREFIX}write`, {
      path,
      content,
      encoding,
    });
  }

  async mkdir(path) {
    return this._makeRequest("POST", `${API_PREFIX}mkdir`, { path });
  }

  async delete(path) {
    const encodedPath = encodeURIComponent(path);
    return this._makeRequest("DELETE", `${API_PREFIX}delete?path=${encodedPath}`);
  }

  async move(source, destination) {
    return this._makeRequest("POST", `${API_PREFIX}move`, {
      source,
      destination,
    });
  }
}

export { RemoteClient };

