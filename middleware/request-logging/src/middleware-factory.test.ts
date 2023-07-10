import request from 'supertest'
import express from 'express'
import type {NextHandleFunction} from 'connect'
import type {Server} from 'node:http'
import requestLoggingMiddlewareFactory from './middleware-factory'

const getSimpleApp = (middleware?: NextHandleFunction): express.Express => {
  const app = express()
  middleware && app.use(middleware)
  app.get('/ping', (req, res) => {
    res.status(200).json({foo: 'bar'})
  })

  return app
}

const withSimpleApp =
  (middleware?: NextHandleFunction) =>
  async (callback: (app: express.Express) => void | Promise<void>): Promise<void> => {
    const app = getSimpleApp(middleware)

    const server = await new Promise<Server>(resolve => {
      const s = app.listen(9987, () => {
        resolve(s)
      })
    })

    await callback(app)

    server.close()
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
})
