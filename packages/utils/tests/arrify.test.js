const arrify = require("../lib/arrify");

test("should convert string to array", () => {
  expect(arrify("test")).toEqual(expect.arrayContaining(["test"]));
});

test("should convert array to array", () => {
  expect(arrify(["test1", "test2"])).toEqual(expect.arrayContaining(["test1", "test2"]));
});
