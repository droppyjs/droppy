const MOCK_HOME = "/users/test";
jest.mock("os", () => ({
  homedir: jest.fn()
}));

const {homedir} = require("os");

const untildify = require("../lib/untildify");

test("simple resolution", () => {
  homedir.mockImplementation(() => MOCK_HOME);

  // These should resolve
  expect(untildify("~")).toEqual(expect.stringMatching(MOCK_HOME));
  expect(untildify("~/dev")).toEqual(expect.stringMatching(`${MOCK_HOME}/dev`));

  // These one shouldn't resolve
  expect(untildify("foo")).toEqual(expect.stringMatching("foo"));
  expect(untildify("~abc")).toEqual(expect.stringMatching("~abc"));
});

test("with path resolution included", () => {
  homedir.mockImplementation(() => MOCK_HOME);

  expect(untildify(`${MOCK_HOME}/test`)).toEqual(expect.stringMatching(`${MOCK_HOME}/test`));
});

test("no home", () => {
  homedir.mockImplementation(() => undefined);

  expect(untildify("~")).toEqual(expect.stringMatching("~"));
  expect(untildify("~/dev")).toEqual(expect.stringMatching(`~/dev`));

  expect(untildify("foo")).toEqual(expect.stringMatching("foo"));
  expect(untildify("~abc")).toEqual(expect.stringMatching("~abc"));
});

test("paths with regex replacement patterns", () => {
  expect(untildify("~$&")).toEqual("~$&");
  expect(untildify("~$1")).toEqual("~$1");
});
