/**
 *
 * @param {*} req
 * @returns {string}
 */
module.exports = (req) => {
  return req.headers && req.headers["x-real-port"] ||
        req.connection && req.connection.remotePort ||
        req.connection && req.connection.socket && req.connection.socket.remotePort ||
        req.port || // custom cached property
        req.remotePort && req.remotePort;
};
