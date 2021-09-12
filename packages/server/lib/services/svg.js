"use strict";

const svgstore = require("@droppyjs/svgstore");
const {paths} = require("@droppyjs/utils");
const fs = require("fs");
const path = require("path");

module.exports = function svg() {
  const sprites = svgstore({
    svgAttrs: {
      style: "display: none",
    },
  });

  fs.readdirSync(paths.locations.svg).forEach(file => {
    sprites.add(`i-${file.replace(/\.svg/, "")}`, fs.readFileSync(path.join(paths.locations.svg, file)));
  });

  return sprites.toString({inline: true});
};
