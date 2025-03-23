/** @type {import('jest').Config} */
const config = {
  // Use the JSDOM test environment 
  testEnvironment: 'jsdom',
  
  // Set up files to run before tests
  setupFilesAfterEnv: ['jest-expect-message'],
  
  // Allow tests to run in parallel
  maxWorkers: '50%',
  
  // Display detailed test output
  verbose: true,
  
  // Clear mocks between each test
  clearMocks: true,
  
  // Collect coverage information
  collectCoverage: false,
  collectCoverageFrom: [
    "**/*.{js,jsx}", 
    "!**/node_modules/**",
    "!**/vendor/**",
    "!**/tests/**",
    "!**/coverage/**",
    "!**/.history/**",
    "!**/*.min.*",
    "!**/*.config.*"
  ],

  // Where to output coverage files
  coverageDirectory: 'coverage',
  
  // Set a timeout for test cases
  testTimeout: 10000,
  
  // Files to ignore for tests
  testPathIgnorePatterns: [
    '/node_modules/'
  ],

  // Files to include for tests
  testMatch: [
    '**/*.test.js'
  ]
};

module.exports = config; 