import request from 'supertest'
import express from 'express'
import type {NextHandleFunction} from 'connect'
import requestLoggingMiddlewareFactory from './middleware-factory'

const getSimpleApp = (middleware?: NextHandleFunction): express.Express => {
  const app = express()
  middleware && app.use(middleware)
  app.get('/ping', (req, res) => {
    res.status(200).json({foo: 'bar'})
  })

  return app
}

describe('requestLoggingMiddlewareFactory', () => {
  const testLogger = {log: jest.fn()}

  afterEach(() => {
    testLogger.log.mockClear()
  })

  it('can be created without crashing', () => {
    requestLoggingMiddlewareFactory({
      loggerAccessor: () => testLogger,
    })
  })

  it('logs a request when it happens', async () => {
    const app = getSimpleApp(
      requestLoggingMiddlewareFactory({
        loggerAccessor: () => testLogger,
      })
    )

    await request(app).get('/ping').expect(200)

    expect(testLogger.log).toBeCalledWith({
      level: 'info',
      message: 'HTTP GET /ping',
      meta: {
        duration: expect.any(Number),
        req: {
          headers: {
            'accept-encoding': 'gzip, deflate',
            connection: expect.any(String),
            host: expect.any(String),
          },
          clientIp: '::ffff:127.0.0.1',
          httpVersion: '1.1',
          method: 'GET',
          query: {},
          url: '/ping',
        },
        res: {
          statusCode: 200,
        },
      },
    })
  })

  it('does not log a request when skip returns true', async () => {
    const app = getSimpleApp(
      requestLoggingMiddlewareFactory({
        loggerAccessor: () => testLogger,
        skip: req => req.url === '/ping',
      })
    )

    await request(app).get('/ping').expect(200)

    expect(testLogger.log).not.toBeCalled()
  })

  it('logs a request when it happens without metaField', async () => {
    const app = getSimpleApp(
      requestLoggingMiddlewareFactory({
        loggerAccessor: () => testLogger,
        metaField: null,
      })
    )

    await request(app).get('/ping').expect(200)

    expect(testLogger.log).toBeCalledWith({
      level: 'info',
      message: 'HTTP GET /ping',
      duration: expect.any(Number),
      req: {
        headers: {
          'accept-encoding': 'gzip, deflate',
          connection: expect.any(String),
          host: expect.any(String),
        },
        clientIp: '::ffff:127.0.0.1',
        httpVersion: '1.1',
        method: 'GET',
        query: {},
        url: '/ping',
      },
      res: {
        statusCode: 200,
      },
    })
  })

  it('uses on-finished hook when configured', async () => {
    const app = getSimpleApp(
      requestLoggingMiddlewareFactory({
        loggerAccessor: () => testLogger,
        hook: 'on-finished',
      })
    )

    await request(app).get('/ping').expect(200)

    expect(testLogger.log).toBeCalledWith(
      expect.objectContaining({
        level: 'info',
        message: 'HTTP GET /ping',
      })
    )
  })

  it('uses level as a function to determine log level', async () => {
    const app = express()
    app.use(
      requestLoggingMiddlewareFactory({
        loggerAccessor: () => testLogger,
        level: (_req, res) => (res.statusCode >= 500 ? 'error' : 'info'),
      })
    )
    app.get('/ok', (_req, res) => res.status(200).json({}))
    app.get('/fail', (_req, res) => res.status(500).json({}))

    await request(app).get('/ok').expect(200)

    expect(testLogger.log).toBeCalledWith(expect.objectContaining({level: 'info'}))

    testLogger.log.mockClear()

    await request(app).get('/fail').expect(500)

    expect(testLogger.log).toBeCalledWith(expect.objectContaining({level: 'error'}))
  })

  it('includes baseMeta in log output', async () => {
    const app = getSimpleApp(
      requestLoggingMiddlewareFactory({
        loggerAccessor: () => testLogger,
        baseMeta: {service: 'test-service', version: '1.0.0'},
      })
    )

    await request(app).get('/ping').expect(200)

    expect(testLogger.log).toBeCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({
          service: 'test-service',
          version: '1.0.0',
        }),
      })
    )
  })

  it('uses custom reqField and resField names', async () => {
    const app = getSimpleApp(
      requestLoggingMiddlewareFactory({
        loggerAccessor: () => testLogger,
        reqField: 'request',
        resField: 'response',
      })
    )

    await request(app).get('/ping').expect(200)

    const logCall = testLogger.log.mock.calls[0][0]
    expect(logCall.meta.request).toBeDefined()
    expect(logCall.meta.response).toBeDefined()
    expect(logCall.meta.req).toBeUndefined()
    expect(logCall.meta.res).toBeUndefined()
  })

  it('flattens req/res meta to root when field is null', async () => {
    const app = getSimpleApp(
      requestLoggingMiddlewareFactory({
        loggerAccessor: () => testLogger,
        metaField: null,
        reqField: null,
        resField: null,
      })
    )

    await request(app).get('/ping').expect(200)

    const logCall = testLogger.log.mock.calls[0][0]
    expect(logCall.method).toBe('GET')
    expect(logCall.statusCode).toBe(200)
    expect(logCall.url).toBe('/ping')
  })

  it('accepts requestToMeta as an array of formatters', async () => {
    const app = getSimpleApp(
      requestLoggingMiddlewareFactory({
        loggerAccessor: () => testLogger,
        requestToMeta: [req => ({method: req.method}), req => ({url: req.url})],
      })
    )

    await request(app).get('/ping').expect(200)

    const logCall = testLogger.log.mock.calls[0][0]
    expect(logCall.meta.req).toStrictEqual({method: 'GET', url: '/ping'})
  })

  it('includes contextToMeta data when provided', async () => {
    const app = getSimpleApp(
      requestLoggingMiddlewareFactory({
        loggerAccessor: () => testLogger,
        contextToMeta: () => ({traceId: 'abc-123'}),
      })
    )

    await request(app).get('/ping').expect(200)

    const logCall = testLogger.log.mock.calls[0][0]
    expect(logCall.meta.ctx).toStrictEqual({traceId: 'abc-123'})
  })

  it('uses custom ctxField name', async () => {
    const app = getSimpleApp(
      requestLoggingMiddlewareFactory({
        loggerAccessor: () => testLogger,
        contextToMeta: () => ({traceId: 'abc-123'}),
        ctxField: 'context',
      })
    )

    await request(app).get('/ping').expect(200)

    const logCall = testLogger.log.mock.calls[0][0]
    expect(logCall.meta.context).toStrictEqual({traceId: 'abc-123'})
    expect(logCall.meta.ctx).toBeUndefined()
  })

  it('uses a custom messageTemplate', async () => {
    const app = getSimpleApp(
      requestLoggingMiddlewareFactory({
        loggerAccessor: () => testLogger,
        messageTemplate: (req: any, res: any) => `${req.method} ${req.url} -> ${res.statusCode}`,
      })
    )

    await request(app).get('/ping').expect(200)

    expect(testLogger.log).toBeCalledWith(expect.objectContaining({message: 'GET /ping -> 200'}))
  })
})
