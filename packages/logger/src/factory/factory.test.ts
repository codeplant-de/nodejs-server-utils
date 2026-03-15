import loggerFactory from './factory'
import {createTestOutput} from '../test-utils'

describe('logger-factory', () => {
  it('creates a valid logger', () => {
    const logger = loggerFactory()

    expect(logger.warn).toBeFunction()
  })

  describe('outputs', () => {
    it('should output to console by default', () => {
      const logger = loggerFactory({silent: true})

      logger.info('test message')

      expect(logger).toHaveLogged([expect.anything()])
    })

    it('supports reading test logs from a custom test stream', async () => {
      const logStream = createTestOutput()

      const logger = loggerFactory({silent: true, testOutputStream: logStream})
      logger.info('test message')

      expect(logStream.toString()).toMatch(/test message/)
      // empty line at end, therefore out log line + one empty line
      expect(logStream.toString().split('\n')).toHaveLength(2)
    })
  })

  describe('options.dynamicMeta', () => {
    it('properly adds the dynamicMeta formatter', () => {
      const logStream = createTestOutput()

      const dynamicMeta = jest.fn(() => ({dynamic: 'meta'}))

      const logger = loggerFactory({
        silent: true,
        testOutputStream: logStream,
        dynamicMeta,
      })

      logger.info('test message')

      expect(dynamicMeta).toHaveBeenCalledOnce()
      expect(JSON.parse(logStream.toString())).toStrictEqual({
        dynamic: 'meta',
        level: 'info',
        message: 'test message',
        timestamp: expect.anything(),
      })
    })
  })

  describe('options.baseMeta', () => {
    it('includes baseMeta in all log output', () => {
      const logStream = createTestOutput()
      const logger = loggerFactory({
        silent: true,
        testOutputStream: logStream,
        baseMeta: {service: 'my-service', env: 'test'},
      })

      logger.info('hello')

      expect(JSON.parse(logStream.toString())).toStrictEqual(
        expect.objectContaining({
          service: 'my-service',
          env: 'test',
          message: 'hello',
        })
      )
    })
  })

  describe('options.logLevel', () => {
    it('suppresses messages below the configured level', () => {
      const logStream = createTestOutput()
      const logger = loggerFactory({
        silent: true,
        testOutputStream: logStream,
        logLevel: 'warn',
      })

      logger.info('should be hidden')
      logger.warn('should appear')

      expect(logStream).toHaveLogged([
        expect.objectContaining({level: 'warn', message: 'should appear'}),
      ])
    })
  })

  describe('log() method', () => {
    it('delegates to the correct level method when level is a string', () => {
      const logStream = createTestOutput()
      const logger = loggerFactory({silent: true, testOutputStream: logStream})

      logger.log('info', 'via log method')

      expect(logStream).toHaveLogged([
        expect.objectContaining({level: 'info', message: 'via log method'}),
      ])
    })

    it('delegates correctly when given a LogEntry object', () => {
      const logStream = createTestOutput()
      const logger = loggerFactory({silent: true, testOutputStream: logStream})

      logger.log({level: 'warn', message: 'entry object', extra: 'data'})

      expect(logStream).toHaveLogged([
        expect.objectContaining({level: 'warn', message: 'entry object', extra: 'data'}),
      ])
    })

    it('throws an error for an invalid log level', () => {
      const logger = loggerFactory({silent: true})

      expect(() => logger.log('nonexistent' as any, 'msg')).toThrow(
        'invalid log level: nonexistent'
      )
    })
  })

  describe('child() logger', () => {
    it('creates a child logger that inherits parent config and adds child meta', () => {
      const logStream = createTestOutput()
      const logger = loggerFactory({
        silent: true,
        testOutputStream: logStream,
        baseMeta: {service: 'parent'},
      })

      const child = logger.child({component: 'child'})
      child.info('from child')

      expect(logStream).toHaveLogged([
        expect.objectContaining({
          service: 'parent',
          component: 'child',
          message: 'from child',
        }),
      ])
    })

    it('does not add child meta to parent logger output', () => {
      const logStream = createTestOutput()
      const logger = loggerFactory({silent: true, testOutputStream: logStream})

      logger.child({component: 'child'})
      logger.info('from parent')

      const output = JSON.parse(logStream.toString())
      expect(output).not.toHaveProperty('component')
    })
  })

  describe('_output property', () => {
    it('exposes _output when silent is true in test environment', () => {
      const logger = loggerFactory({silent: true})

      expect(logger).toHaveProperty('_output')
    })

    it('does not expose _output when silent is not set', () => {
      const logger = loggerFactory()

      expect(logger).not.toHaveProperty('_output')
    })
  })
})
