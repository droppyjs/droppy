const countOccurences = require("../lib/countOccurences");

test("should work across a single line", () => {
  expect(countOccurences("AB AB AB CD CD CD", "AB")).toBe(3);
});

test("should work across a multiple lines line", () => {
  expect(countOccurences("CAT CAT TEST2\nCAT TEST2 CAT\nTEST2 TEST2 CAT TEST1", "TEST2")).toBe(4);
});
