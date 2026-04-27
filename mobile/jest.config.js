/** @type {import('jest').Config} */
module.exports = {
  projects: [
    // Pure TypeScript lib tests — no React Native environment needed
    {
      displayName: 'lib',
      testEnvironment: 'node',
      testRegex: 'src/(lib|hooks|i18n)/__tests__/.*\\.test\\.ts$',
      globals: { __DEV__: true },
      transform: {
        '^.+\\.[jt]sx?$': ['babel-jest', { configFile: './babel.config.js' }],
      },
      // Allow ES modules from packages that ship them
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|expo-auth-session|expo-web-browser|expo-modules-core)',
      ],
      collectCoverageFrom: [
        'src/lib/**/*.{ts,tsx}',
        '!src/lib/__tests__/**',
        '!src/lib/**/*.test.{ts,tsx}',
      ],
    },
    // Screen-level integration tests — full jest-expo environment (lib, hooks, components, and screens each have their own project)
    {
      displayName: 'rn',
      preset: 'jest-expo',
      testRegex: 'src/(?!(lib|hooks|components|screens)/).*__tests__/.*\\.test\\.(ts|tsx)$',
      setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|date-fns|react-native-markdown-display)',
      ],
      collectCoverageFrom: [
        'src/hooks/**/*.{ts,tsx}',
        '!src/**/__tests__/**',
        '!src/**/*.test.{ts,tsx}',
      ],
    },
    // Screen unit tests — node environment to avoid jest-expo setup.js failures on Node 22 + RN 0.76
    // See: mobile/CLAUDE.md "jest-expo preset fails with RN 0.76 in Node 22"
    {
      displayName: 'screens',
      testEnvironment: 'node',
      testRegex: 'src/screens/.*__tests__/.*\\.test\\.tsx?$',
      globals: { __DEV__: true },
      transform: {
        '^.+\\.tsx?$': ['babel-jest', { configFile: './babel.config.js' }],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^react-native$': '<rootDir>/src/__mocks__/react-native.js',
        '^react-native-safe-area-context$': '<rootDir>/src/__mocks__/react-native-safe-area-context.js',
        '^react-native-markdown-display$': '<rootDir>/src/__mocks__/react-native-markdown-display.js',
      },
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*)',
      ],
      collectCoverageFrom: [
        'src/screens/**/*.{ts,tsx}',
        '!src/screens/**/__tests__/**',
        '!src/screens/**/*.test.{ts,tsx}',
      ],
    },
    // Component unit tests — node environment to avoid jest-expo setup.js failures on Node 22 + RN 0.76
    // See: mobile/CLAUDE.md "jest-expo preset fails with RN 0.76 in Node 22"
    {
      displayName: 'components',
      testEnvironment: 'node',
      testRegex: 'src/components/.*__tests__/.*\\.test\\.tsx$',
      globals: { __DEV__: true },
      transform: {
        '^.+\\.tsx?$': ['babel-jest', { configFile: './babel.config.js' }],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^react-native$': '<rootDir>/src/__mocks__/react-native.js',
        '^react-native-markdown-display$': '<rootDir>/src/__mocks__/react-native-markdown-display.js',
      },
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|react-native-markdown-display)',
      ],
      collectCoverageFrom: [
        'src/components/**/*.{ts,tsx}',
        '!src/components/**/__tests__/**',
        '!src/components/**/*.test.{ts,tsx}',
      ],
    },
  ],
  coverageThreshold: {
    global: {
      lines: 80,
    },
    // Per-directory thresholds prevent high-coverage lib files from masking
    // untested screens/components. Thresholds start conservative and should
    // be raised incrementally as coverage improves. Target: 80% for all.
    './src/screens/': {
      lines: 50, // target 80% — raise as gap-closing tests are added
    },
    './src/components/': {
      lines: 60, // target 80% — raise as coverage improves
    },
  },
};
