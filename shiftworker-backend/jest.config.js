/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  setupFilesAfterEnv: ["jest-extended/all"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: { types: ["jest", "jest-extended"] } }],
  },
};
