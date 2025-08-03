module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.test.ts'
  ],
  collectCoverageFrom: [
    'scripts/**/*.js',
    'tests/**/*.js'
  ],
  verbose: true,
  displayName: 'Translation Tests'
};
