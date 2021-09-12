const formatBytes = require("../lib/formatBytes");

test("0.5 B", () => {
  expect(formatBytes(0.5)).toBe("0.5 B");
});

test("0 B", () => {
  expect(formatBytes(0)).toBe("0 B");
});

test("250 B", () => {
  expect(formatBytes(250)).toBe("250 B");
});

test("123 kB", () => {
  expect(formatBytes(123000)).toBe("123 kB");
});

test("10.1 MB", () => {
  expect(formatBytes(10123000)).toBe("10.1 MB");
});

test("1.25 GB", () => {
  expect(formatBytes(1250000000)).toBe("1.25 GB");
});

test("910 GB", () => {
  expect(formatBytes(910000000000)).toBe("910 GB");
});

test("12.0 TB", () => {
  expect(formatBytes(12000000000000)).toBe("12.0 TB");
});

test("1.30 PB", () => {
  expect(formatBytes(1300000000000000)).toBe("1.30 PB");
});
