module.exports = {
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testMatch: [
    "**/test/**/*.test.(ts|js)"
  ],
};