import request from 'supertest'
import requestLoggingMiddlewareFactory from '../middleware-factory'
import {measureFunctionPerformance, withSimpleApp, PerformanceResult} from './utils'

describe('requestLoggingMiddlewareFactory performance', () => {
  const testLogger = {log: jest.fn()}

  afterEach(() => {
    testLogger.log.mockClear()
  })

  it('logs requests in a reasonable amount of time (full express stack)', async () => {
    let baseLine: PerformanceResult

    // get the baseline
    await withSimpleApp(undefined, {resDelay: 10})(async app => {
      baseLine = await measureFunctionPerformance(() => request(app).get('/ping'))
    })

    await withSimpleApp(
      requestLoggingMiddlewareFactory({
        loggerAccessor: () => testLogger,
      }),
      {resDelay: 10}
    )(async app => {
      const res = await measureFunctionPerformance(() => request(app).get('/ping'))

      console.log({res, baseLine})

      // max 30% less requests
      expect(res.count).toBeGreaterThanOrEqual(baseLine.count * 0.3)

      // max 30% higher 50th percentile
      expect(res.percentiles[50]).toBeLessThanOrEqual(baseLine.percentiles[50] * 1.3)
    })
  }, 30e3)
})
