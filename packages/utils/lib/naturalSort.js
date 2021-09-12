const strcmp = require("./strcmp");

module.exports = (a, b) => {
  const x = [], y = [];

  a.replace(/(\d+)|(\D+)/g, (_, a, b) => { x.push([a || 0, b]); });
  b.replace(/(\d+)|(\D+)/g, (_, a, b) => { y.push([a || 0, b]); });

  while (x.length && y.length) {
    const xx = x.shift();
    const yy = y.shift();
    const nn = (xx[0] - yy[0]) || strcmp(xx[1], yy[1]);
    if (nn) {
      return nn;
    }
  }

  if (x.length) {
    return -1;
  }

  if (y.length) {
    return 1;
  }

  return 0;
};
