/**
 *
 * @param {string} string
 * @param {string} search
 * @returns {number}
 */
module.exports = (string, search) => {
  let num = 0, pos = 0;

  while (true) {
    pos = string.indexOf(search, pos);
    if (pos >= 0) {
      num += 1;
      pos += search.length;
    } else break;
  }
  return num;
};
