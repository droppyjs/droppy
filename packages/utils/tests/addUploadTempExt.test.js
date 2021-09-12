const addUploadTempExt = require("../lib/addUploadTempExt");

test("should return with suffix", () => {
  expect(addUploadTempExt("example.png")).toBe("example.png.droppy-upload");
});
