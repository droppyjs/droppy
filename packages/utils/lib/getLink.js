module.exports = (links, length) => {
  const linkChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";

  let link = "";
  do {
    while (link.length < length) {
      link += linkChars.charAt(Math.floor(Math.random() * linkChars.length));
    }
  } while (links[link]); // In case the RNG generates an existing link, go again

  return link;
};
