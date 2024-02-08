"use strict";

const svgstore = require("@droppyjs/svgstore");
const fs = require("fs");
const path = require("path");
const paths = require("./paths.js");

module.exports = function svg() {
  const sprites = svgstore({
    svgAttrs: {
      style: "display: none",
    },
  });

  fs.readdirSync(paths.get().svg).forEach(file => {
    sprites.add(`i-${file.replace(/\.svg/, "")}`, fs.readFileSync(path.join(paths.get().svg, file)));
  });

  return sprites.toString({inline: true});
};
