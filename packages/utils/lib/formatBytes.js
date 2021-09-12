const units = ["B", "kB", "MB", "GB", "TB", "PB"];

/**
 *
 * @param {number} num
 * @returns
 */
module.exports = (num) => {
  if (num < 1) {
    return `${num} B`;
  }

  const exp = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1);
  return `${(num / (1000 ** exp)).toPrecision(3)} ${units[exp]}`;
};
