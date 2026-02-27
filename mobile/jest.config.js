/** @type {import('jest').Config} */
module.exports = {
  projects: [
    // Pure TypeScript lib tests — no React Native environment needed
    {
      displayName: 'lib',
      testEnvironment: 'node',
      testRegex: 'src/(lib|hooks)/__tests__/.*\\.test\\.ts$',
      transform: {
        '^.+\\.tsx?$': ['babel-jest', { configFile: './babel.config.js' }],
      },
      // Allow ES modules from packages that ship them
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*)',
      ],
      collectCoverageFrom: [
        'src/lib/**/*.{ts,tsx}',
        '!src/lib/__tests__/**',
        '!src/lib/**/*.test.{ts,tsx}',
      ],
    },
    // React Native component and hook tests — full jest-expo environment
    {
      displayName: 'rn',
      preset: 'jest-expo',
      testRegex: 'src/(?!(lib|hooks)/).*__tests__/.*\\.test\\.(ts|tsx)$',
      setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|date-fns)',
      ],
      collectCoverageFrom: [
        'src/hooks/**/*.{ts,tsx}',
        '!src/**/__tests__/**',
        '!src/**/*.test.{ts,tsx}',
      ],
    },
  ],
  coverageThreshold: {
    global: {
      lines: 80,
    },
  },
};
