// module.exports = {
//   testEnvironment: 'node',
//   testMatch: ['**/test/jest/**/*.test.js'],
//   collectCoverageFrom: [
//     'utils/**/*.js',
//     'routes/**/*.js',
//     '!**/node_modules/**',
//     '!**/tests/**'
//   ],
//   verbose: true
// };

// module.exports = {
//   testEnvironment: 'node',
//   testMatch: ['**/test/jest/**/*.test.js'],
//   collectCoverage: true,
//   coverageDirectory: 'coverage/jest',
//   verbose: true
// };

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/jest/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage/jest',
  coveragePathIgnorePatterns: [
    'node_modules',
    'index.js',
    'services/healthChecker.js',
  ],
  verbose: true
};