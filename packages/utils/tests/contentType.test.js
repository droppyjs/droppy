const contentType = require("../lib/contentType");

test("overrides to work", () => {
  expect(contentType("test.mkv")).toBe("video/webm");
});

test("formats to resolve correctly", () => {
  expect(contentType("test.mov")).toBe("video/quicktime");
  expect(contentType("test.mp4")).toBe("video/mp4");
  expect(contentType("test.png")).toBe("image/png");
  expect(contentType("test.jpg")).toBe("image/jpeg");
  expect(contentType("sample/.test.mp4")).toBe("video/mp4");
  expect(contentType("sample/.test.json")).toBe("application/json; charset=UTF-8");
});

test("extension to resolve", () => {
  expect(contentType("css")).toBe("text/css; charset=UTF-8");
  expect(contentType("js")).toBe("application/javascript; charset=UTF-8");
  expect(contentType("html")).toBe("text/html; charset=UTF-8");
});

test("invalid extensions to resolve to application/octet-stream", () => {
  expect(contentType("inv4lid")).toBe("application/octet-stream");
  expect(contentType("badextension")).toBe("application/octet-stream");
});

test("handle text file path", () => {
  expect(contentType(`${__dirname}/files/test`)).toBe("text/plain");
  expect(contentType(`${__dirname}/files/grep`)).toBe("application/octet-stream");
});
