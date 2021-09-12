"use strict";

const crypto = require("crypto");
const _http = require("http");

const csrf = module.exports = {};

let tokens = [];

/**
 * Create and store a CSRF token.
 * CSRF tokens are unique, and locked to user agents.
 * @param {_http.IncomingMessage} req
 * @returns
 */
csrf.create = (req) => {
  const {"user-agent": reqUserAgent = "none"} = req.headers;

  const token = crypto.randomBytes(24).toString("hex");

  const tokenEntry = {
    value: token,
    userAgent: crypto.createHash("md5").update(reqUserAgent).digest("hex"),
  };

  tokens.unshift(tokenEntry);

  tokens = tokens.slice(0, 500);
  return token;
};

/**
 * Validate a CSRF token against a request.
 * @param {string} token
 * @param {_http.IncomingMessage} req
 * @returns
 */
csrf.validate = (token, req) => {
  const {"user-agent": reqUserAgent = "none"} = req.headers;

  const hashedUserAgent = crypto.createHash("md5").update(reqUserAgent).digest("hex");

  const tokenEntry = tokens
    .find(({value, userAgent}) => {
      return value === token &&
        userAgent === hashedUserAgent;
    });

  return tokenEntry !== undefined;
};
