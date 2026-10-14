/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterFramework: [],
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setupTests.js"],
  moduleNameMapper: {
    // CSS modules → identity-obj-proxy (returns className as string)
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    // Static assets → empty string
    "\\.(jpg|jpeg|png|gif|svg|ico|webp)$": "<rootDir>/src/__tests__/__mocks__/fileMock.cjs"
  },
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest"
  },
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],
  collectCoverageFrom: [
    "src/components/**/*.{js,jsx}",
    "src/store/**/*.{js,jsx}",
    "!src/**/*.test.{js,jsx}",
    "!src/__tests__/**"
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  }
};
