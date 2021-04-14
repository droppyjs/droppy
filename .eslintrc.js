module.exports = {
  parser: "babel-eslint",
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    jquery: true,
  },
  globals: {
    CodeMirror: false,
    fileExtension: false,
    Handlebars: false,
    Mousetrap: false,
    pdfjsLib: false,
    PhotoSwipe: false,
    PhotoSwipeUI_Default: false,
    Plyr: false,
    screenfull: false,
    Uppie: false,
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: ["react-app"],
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: 6,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        project: `./tsconfig.json`,
      },
      plugins: ["@typescript-eslint"],
      rules: {
        "@typescript-eslint/no-floating-promises": "error",
        // note you must disable the base rule as it can report incorrect errors
        "no-use-before-define": "off",
        // "@typescript-eslint/no-use-before-define": ["error"],
        // note you must disable the base rule as it can report incorrect errors
        "no-redeclare": "off",
        "@typescript-eslint/no-redeclare": ["error"],
      },
    },
    {
      files: ["test/**", "**/__fixtures__/**"],
      rules: {
        "import/no-default-export": "off",
        "require-await": "off",
        "unicorn/filename-case": "off",
      },
    },
  ],
  ignorePatterns: ["**/dist/*", "**/vendor/*.js"],
}
