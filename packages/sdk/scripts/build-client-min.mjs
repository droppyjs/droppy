import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sdkRoot = path.resolve(__dirname, "..");

const inputFile = path.join(sdkRoot, "dist", "client", "index.js");
const outputIifeFile = path.join(sdkRoot, "droppy.global.min.js");
const outputEsmFile = path.join(sdkRoot, "droppy.esm.min.js");

try {
    const header = `//           .:.
//    :::  .:::::.    Droppy
//  ..:::..  :::      Made with love <3
//   ':::'   :::
//     '
// For more information, see https://github.com/droppyjs/droppy
`;
    await build({
        entryPoints: [inputFile],
        outfile: outputIifeFile,
        bundle: true,
        minify: true,
        sourcemap: true,
        platform: "browser",
        format: "iife",
        globalName: "DroppySDK",
        target: ["es2020"],
        logLevel: "silent",
        banner: {
            js: header,
        },
    });
    await build({
        entryPoints: [inputFile],
        outfile: outputEsmFile,
        bundle: true,
        minify: true,
        sourcemap: true,
        platform: "browser",
        format: "esm",
        target: ["es2020"],
        logLevel: "silent",
        banner: {
            js: header,
        },
    });
} catch (err) {
    console.error(`Failed to generate web bundles from ${inputFile}`);
    console.error(err);
    process.exitCode = 1;
}
