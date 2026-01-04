import addFilesPath from "./filesystem/addFilesPath.js";
import contentType from "./filesystem/contentType.js";
import copyDir from "./filesystem/copyDir.js";
import copyFile from "./filesystem/copyFile.js";
import getDispo from "./filesystem/getDispo.js";
import getNewPath from "./filesystem/getNewPath.js";
import isBinary from "./filesystem/isBinary.js";
import isPathSane from "./filesystem/isPathSane.js";
import isValidFilename from "./filesystem/isValidFilename.js";
import mkdir from "./filesystem/mkdir.js";
import move from "./filesystem/move.js";
import normalizePath from "./filesystem/normalizePath.js";
import readFile from "./filesystem/readFile.js";
import removeFilesPath from "./filesystem/removeFilesPath.js";
import sanitizePathsInString from "./filesystem/sanitizePathsInString.js";

import ip from "./http/ip.js";
import port from "./http/port.js";
import readJsonBody from "./http/readJsonBody.js";

import addUploadTempExt from "./strings/addUploadTempExt.js";
import arrify from "./strings/arrify.js";
import countOccurences from "./strings/countOccurences.js";
import createSid from "./strings/createSid.js";
import extensionRe from "./strings/extensionRe.js";
import formatBytes from "./strings/formatBytes.js";
import getLink from "./strings/getLink.js";
import naturalSort from "./strings/naturalSort.js";
import pretty from "./strings/pretty.js";
import removeUploadTempExt from "./strings/removeUploadTempExt.js";
import rootname from "./strings/rootname.js";

export const utils = {
    // Filesystem
    addFilesPath,
    contentType,
    copyDir,
    copyFile,
    getDispo,
    getNewPath,
    isBinary,
    isPathSane,
    isValidFilename,
    mkdir,
    move,
    normalizePath,
    readFile,
    removeFilesPath,
    sanitizePathsInString,

    // HTTP
    ip,
    port,
    readJsonBody,

    // Strings
    addUploadTempExt,
    arrify,
    countOccurences,
    createSid,
    extensionRe,
    formatBytes,
    getLink,
    naturalSort,
    pretty,
    removeUploadTempExt,
    rootname,
};
