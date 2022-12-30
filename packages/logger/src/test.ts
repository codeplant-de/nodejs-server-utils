import loggerFactory from './logger-factory'

export * from './test-utils'

// @todo fix this subpath export... its not working on consumer side

export const defaultTestLogger = loggerFactory({
  silent: true,
})
