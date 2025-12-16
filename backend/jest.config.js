module.exports = {
  testEnvironment: "node",
  coverageDirectory: "coverage",
  collectCoverageFrom: ["*.js", "!jest.config.js"],
  testMatch: ["**/tests/**/*.test.js"],
  verbose: true,
};
