const getLink = require("../lib/getLink");

test("generate 5 char link", () => {
  const length = 5;
  const link = getLink({}, length);

  expect(link).toHaveLength(length);
});

test("generate 20 char link", () => {
  const length = 20;
  const link = getLink({}, length);

  expect(link).toHaveLength(length);
});
