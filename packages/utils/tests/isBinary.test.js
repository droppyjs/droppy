const isBinary = require("../lib/isBinary");

test("should return true without reading file with some extensions", async () => {
  expect(await isBinary("does/not/exist/example.pdf")).toBe(true);
  expect(await isBinary("does/not/exist/example.ps")).toBe(true);
  expect(await isBinary("does/not/exist/example.eps")).toBe(true);
  expect(await isBinary("does/not/exist/example.ai")).toBe(true);
});

test("should return true for real binary file", async () => {
  expect(await isBinary(`${__dirname}/files/grep`)).toBe(true);
});

test("shoudl return false for a not-binary file", async () => {
  expect(await isBinary(`${__dirname}/files/test`)).toBe(false);
});
