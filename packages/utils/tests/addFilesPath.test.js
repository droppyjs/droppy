const addFilesPath = require("../lib/addFilesPath");
const paths = require("../lib/paths");

test("should return root path", () => {
  expect(addFilesPath("/")).toBe(paths.locations.files);
});

test("should return test.png path", () => {
  expect(addFilesPath("test.png")).toBe(`${paths.locations.files}/test.png`);
});
