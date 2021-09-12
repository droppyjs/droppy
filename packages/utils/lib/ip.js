/**
 * TODO: TODO: https://tools.ietf.org/html/rfc7239
 * @param {*} req
 * @returns {string}
 */
module.exports = function(req) {
  return req.headers && req.headers["x-forwarded-for"] && req.headers["x-forwarded-for"].split(",")[0].trim() ||
        req.headers && req.headers["x-real-ip"] ||
        req.connection && req.connection.remoteAddress ||
        req.connection && req.connection.socket && req.connection.socket.remoteAddress ||
        req.addr || // custom cached property
        req.remoteAddress && req.remoteAddress;
};
