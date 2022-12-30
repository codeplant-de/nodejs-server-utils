import loggerFactory from './logger-factory'
import {createTestOutput} from './test-utils'

describe('logger-factory', () => {
  let consoleSpy: jest.SpyInstance<ReturnType<typeof global.process.stdout.write>>

  beforeEach(() => {
    consoleSpy = jest.spyOn(global.process.stdout, 'write')
  })

  afterEach(() => {
    consoleSpy.mockClear()
  })

  it('creates a valid logger', () => {
    const logger = loggerFactory()

    expect(logger.warn).toBeFunction()
  })

  describe('outputs', () => {
    it('should output to console by default', () => {
      const logger = loggerFactory()

      // swallow output
      consoleSpy.mockImplementation(() => true)

      logger.debug('test message')

      expect(consoleSpy).toHaveBeenCalledTimes(1)
    })

    it('supports log silencing for tests', () => {
      const logger = loggerFactory({silent: true})

      logger.debug('test message')

      expect(consoleSpy).toHaveBeenCalledTimes(0)
    })

    it('supports reading test logs from a custom test stream', async () => {
      const [testOutput, stream] = createTestOutput()

      const logger = loggerFactory({silent: true, testOutputStream: testOutput})
      logger.debug('test message')

      expect(stream.toString()).toMatch(/test message/)
      // empty line at end, therefore out log line + one empty line
      expect(stream.toString().split('\n')).toHaveLength(2)
    })
  })
})
