module.exports = [
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        process: "readonly",
        __dirname: "readonly",
        module: "readonly",
        require: "readonly"
      }
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
    }
  }
];
