const pretty = require("../lib/pretty");

test("blank should return quotes in blank", async () => {
  expect(await pretty("")).toEqual(expect.stringMatching("''"));
});

test("spaces should retain wrapped in quotes", async () => {
  expect(await pretty("hello  world")).toEqual(expect.stringMatching("'hello  world'"));
});

test("should use double quotes when single quotes are used", async () => {
  expect(await pretty("'hello' world")).toEqual(expect.stringMatching("\\\"'hello' world\\\""));
});
