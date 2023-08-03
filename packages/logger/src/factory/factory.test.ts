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
})
