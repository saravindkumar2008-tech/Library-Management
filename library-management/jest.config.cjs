/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setupTests.js"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/src/__tests__/setupTests.js",
    "<rootDir>/src/__tests__/testUtils.jsx",
    "<rootDir>/src/__tests__/__mocks__/"
  ],
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
    "**/__tests__/**/*.(spec|test).[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],
  collectCoverageFrom: [
    "src/components/BookCard.{js,jsx}",
    "src/components/BookList.{js,jsx}",
    "src/components/BorrowedBooks.{js,jsx}",
    "src/components/Profile.{js,jsx}",
    "src/components/SearchBar.{js,jsx}",
    "src/components/FilterPanel.{js,jsx}",
    "src/store/librarySlice.{js,jsx}"
  ],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      lines: 50,
      statements: 50
    }
  }
};
