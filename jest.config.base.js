module.exports = {
  roots: [
    "<rootDir>/lib",
    "<rootDir>/tests"
  ],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  testRegex: "(/tests/.*.(test|spec)).(jsx?|tsx?)$",
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    "(tests/.*.mock).(jsx?|tsx?)$"
  ],
  verbose: true
};
