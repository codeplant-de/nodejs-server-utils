import type {Config} from 'jest'

// eslint-disable-next-line arrow-body-style
const buildConfig = (): Config => {
  return {
    preset: '@codeplant-de/jest-config',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    fakeTimers: {enableGlobally: true, now: 1691003989795},
  } satisfies Config
}

export default buildConfig()
