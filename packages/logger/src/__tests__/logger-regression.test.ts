import {createTestOutput} from '../test-utils'
import {loggerFactory} from '../factory'

describe('logger output', () => {
  describe('default configuration', () => {
    const testStream = createTestOutput()
    const logger = loggerFactory({
      silent: true,
      testOutputStream: testStream,
    })

    beforeEach(() => {
      testStream.clear()
    })

    it('prints a info message in the correct format', async () => {
      logger.info('test message')

      expect(testStream).toHaveLogged([
        {level: 'info', message: 'test message', timestamp: '2023-08-02T19:19:49.795Z'},
      ])
    })

    it('hides debug message by default', () => {
      logger.debug('test message')

      expect(testStream).toHaveLogged([])
    })

    it('interpolates log message with meta information', () => {
      logger.info('some test with %d %s', 2, 'placeholders')

      expect(testStream).toHaveLogged([
        {
          level: 'info',
          timestamp: '2023-08-02T19:19:49.795Z',
          message: 'some test with 2 placeholders',
        },
      ])
    })

    it('allows passing of additional meta data', () => {
      logger.info('message', {with: 'meta'})

      expect(testStream).toHaveLogged([
        {level: 'info', message: 'message', timestamp: '2023-08-02T19:19:49.795Z', with: 'meta'},
      ])
    })

    it('handles deeply nested meta objects', () => {
      logger.info('message', {deeply: {nested: {object: {foo: 'bar'}}}})

      expect(testStream).toHaveLogged([
        {
          deeply: {nested: {object: {foo: 'bar'}}},
          level: 'info',
          message: 'message',
          timestamp: '2023-08-02T19:19:49.795Z',
        },
      ])
    })

    it('allows logging by passing a log entry', () => {
      logger.log({
        level: 'info',
        message: 'some message',
        withMeta: 'test meta',
      })

      expect(testStream).toHaveLogged([
        {
          level: 'info',
          message: 'some message',
          timestamp: '2023-08-02T19:19:49.795Z',
          withMeta: 'test meta',
        },
      ])
    })

    it('inlines meta objects into the log message if interpolation is desired', () => {
      logger.info('some message %o', {inlined: 'data'})

      expect(testStream).toHaveLogged([
        {
          level: 'info',
          message: "some message { inlined: 'data' }",
          timestamp: '2023-08-02T19:19:49.795Z',
        },
      ])
    })

    it('partially inlines meta if interpolation is desired', () => {
      logger.info('some message %o', {inlined: 'data'}, {additional: 'meta'})

      expect(testStream).toHaveLogged([
        {
          level: 'info',
          message: "some message { inlined: 'data' }",
          timestamp: '2023-08-02T19:19:49.795Z',
          additional: 'meta',
        },
      ])
    })
  })

  describe('log level configuration', () => {
    const testStream = createTestOutput()
    const logger = loggerFactory({
      silent: true,
      testOutputStream: testStream,
      logLevel: 'error',
    })

    beforeEach(() => {
      testStream.clear()
    })

    it('prints a error message in the correct format', () => {
      logger.error('test message')

      expect(testStream).toHaveLogged([
        {level: 'error', message: 'test message', timestamp: '2023-08-02T19:19:49.795Z'},
      ])
    })

    it('hides warn message by default', () => {
      logger.warn('test message')

      expect(testStream).toHaveLogged([])
    })
  })

  describe('base meta configuration', () => {
    const testStream = createTestOutput()
    const logger = loggerFactory({
      silent: true,
      testOutputStream: testStream,
      baseMeta: {service: 'test-service'},
    })

    beforeEach(() => {
      testStream.clear()
    })

    it('attaches the base meta information to all log messages', () => {
      logger.info('test message')

      expect(testStream).toHaveLogged([
        {
          level: 'info',
          message: 'test message',
          timestamp: '2023-08-02T19:19:49.795Z',
          service: 'test-service',
        },
      ])
    })

    it('allows overriding keys provided as base meta', () => {
      logger.info('test message', {service: 'different-service'})

      expect(testStream).toHaveLogged([
        {
          level: 'info',
          message: 'test message',
          timestamp: '2023-08-02T19:19:49.795Z',
          service: 'different-service',
        },
      ])
    })
  })

  describe('dynamic meta configuration', () => {
    let counter = 0
    const testStream = createTestOutput()
    const logger = loggerFactory({
      silent: true,
      testOutputStream: testStream,
      dynamicMeta: () => ({
        line: counter++,
      }),
    })

    beforeEach(() => {
      testStream.clear()
    })

    it('attaches the dynamic meta information to all log messages', () => {
      logger.info('test message')
      logger.info('test message')

      expect(testStream).toHaveLogged([
        {
          level: 'info',
          message: 'test message',
          timestamp: '2023-08-02T19:19:49.795Z',
          line: 0,
        },
        {
          level: 'info',
          message: 'test message',
          timestamp: '2023-08-02T19:19:49.795Z',
          line: 1,
        },
      ])
    })

    it('allows overriding keys provided as dynamic meta', () => {
      logger.info('test message', {line: 'some line'})

      expect(testStream).toHaveLogged([
        {
          level: 'info',
          message: 'test message',
          timestamp: '2023-08-02T19:19:49.795Z',
          line: 'some line',
        },
      ])
    })
  })

  describe('error logging', () => {
    const testStream = createTestOutput()
    const logger = loggerFactory({
      silent: true,
      testOutputStream: testStream,
    })

    beforeEach(() => {
      testStream.clear()
    })

    it('formats error objects', () => {
      logger.warn(new Error('test error'))

      expect(testStream).toHaveLogged([
        {
          level: 'warn',
          timestamp: '2023-08-02T19:19:49.795Z',
          message: 'test error',
          error: {
            message: 'test error',
            stack: expect.any(String),
            type: 'Error',
          },
        },
      ])
    })

    it('allows passing errors as meta', () => {
      logger.warn('some message', {error: new Error('test error')})

      expect(testStream).toHaveLogged([
        {
          level: 'warn',
          timestamp: '2023-08-02T19:19:49.795Z',
          message: 'some message',
          error: {
            message: 'test error',
            stack: expect.any(String),
            type: 'Error',
          },
        },
      ])
    })

    it('logs a custom error properly', () => {
      class TestError extends Error {
        statusCode: number
        constructor(message: string, statusCode: number) {
          super(message)
          this.statusCode = statusCode

          if (Error.captureStackTrace) {
            Error.captureStackTrace(this, TestError)
          }
        }
      }

      logger.warn('some %s', 'message', {error: new TestError('test error', 404)})

      expect(testStream).toHaveLogged([
        {
          level: 'warn',
          timestamp: '2023-08-02T19:19:49.795Z',
          message: 'some message',
          error: {
            message: 'test error',
            stack: expect.any(String),
            type: 'TestError',
            statusCode: 404,
          },
        },
      ])
    })
  })
})
