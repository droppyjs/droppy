// Function referenced from https://github.com/sindresorhus/valid-filename
// Copyright (c) Sindre Sorhus <sindresorhus@gmail.com>
// LICENSE: https://github.com/sindresorhus/valid-filename/blob/main/license

// biome-ignore lint/suspicious/noControlCharactersInRegex: legacy
const filenameReservedRegex = /[<>:"/\\|?*\u0000-\u001F]/g;
const windowsReservedNameRegex = /^(con|prn|aux|nul|com\d|lpt\d)$/i;

export default function isValidFilename(string) {
    if (!string || string.length > 255) {
        return false;
    }

    if (
        filenameReservedRegex.test(string) ||
        windowsReservedNameRegex.test(string)
    ) {
        return false;
    }

    if (string === "." || string === "..") {
        return false;
    }

    return true;
}
