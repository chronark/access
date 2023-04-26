/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  injectGlobals: false,
  verbose: true,
  maxConcurrency: 1,
  transform: {},
};
