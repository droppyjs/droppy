/**
 *
 * @param {*} req
 * @returns {Promise<String>}
 */
module.exports = function(req) {
  return new Promise(((resolve, reject) => {
    try {
      if (req.body) {
                // This is needed if the express application is using body-parser
        if (typeof req.body === "object") {
          resolve(req.body);
        } else {
          resolve(JSON.parse(req.body));
        }
      } else {
        let body = [];
        req.on("data", chunk => {
          body.push(chunk);
        }).on("end", () => {
          body = String(Buffer.concat(body));
          resolve(JSON.parse(body));
        });
      }
    } catch (err) {
      reject(err);
    }
  }));
};
