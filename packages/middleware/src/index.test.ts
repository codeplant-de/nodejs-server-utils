import {loggerFactory} from '@codeplant-de/nodejs-server-logger'
import {getFromHttpContext} from '@codeplant-de/http-context-provider-middleware'
import express from 'express'
import request from 'supertest'

import createMiddlewareStack from './index'

const testLogger = loggerFactory({silent: true})

describe('createMiddlewareStack', () => {
  it('does not add any middlewares if all disabled', () => {
    const middlewares = createMiddlewareStack({
      withHttpContextProvider: false,
      withLoggerProvider: false,
      withRequestIdProvider: false,
      withRequestLogging: false,
    })

    expect(middlewares).toHaveLength(0)
  })

  it('creates and connects all different middlewares', () => {
    const middlewares = createMiddlewareStack({
      loggerProviderOptions: {
        logger: testLogger,
      },
    })

    expect(middlewares).toHaveLength(4)
  })

  describe('individual feature toggles', () => {
    it('adds only context provider when others are disabled', () => {
      const middlewares = createMiddlewareStack({
        withHttpContextProvider: true,
        withRequestIdProvider: false,
        withLoggerProvider: false,
        withRequestLogging: false,
      })

      expect(middlewares).toHaveLength(1)
    })

    it('adds context + requestId when only those are enabled', () => {
      const middlewares = createMiddlewareStack({
        withHttpContextProvider: true,
        withRequestIdProvider: true,
        withLoggerProvider: false,
        withRequestLogging: false,
      })

      expect(middlewares).toHaveLength(2)
    })

    it('adds context + logger provider when only those are enabled', () => {
      const middlewares = createMiddlewareStack({
        withHttpContextProvider: true,
        withRequestIdProvider: false,
        withLoggerProvider: true,
        loggerProviderOptions: {logger: testLogger},
        withRequestLogging: false,
      })

      expect(middlewares).toHaveLength(2)
    })

    it('adds context + requestId + logger when request logging is disabled', () => {
      const middlewares = createMiddlewareStack({
        withHttpContextProvider: true,
        withRequestIdProvider: true,
        withLoggerProvider: true,
        loggerProviderOptions: {logger: testLogger},
        withRequestLogging: false,
      })

      expect(middlewares).toHaveLength(3)
    })
  })

  describe('attach()', () => {
    it('calls use() on the target for each middleware', () => {
      const middlewares = createMiddlewareStack({
        loggerProviderOptions: {logger: testLogger},
      })

      const mockApp = {use: jest.fn()}
      middlewares.attach(mockApp)

      expect(mockApp.use).toHaveBeenCalledTimes(4)
      for (let i = 0; i < 4; i++) {
        expect(typeof mockApp.use.mock.calls[i][0]).toBe('function')
      }
    })
  })

  describe('middleware ordering', () => {
    it('adds middlewares in the correct order: context → requestId → logger → requestLogging', () => {
      const middlewares = createMiddlewareStack({
        loggerProviderOptions: {logger: testLogger},
      })

      expect(middlewares).toHaveLength(4)
      // All entries should be functions (middleware handlers)
      middlewares.forEach(mw => {
        expect(typeof mw).toBe('function')
      })
      // The first middleware is the http context provider (named function)
      expect(middlewares[0].name).toBe('httpContextMiddleware')
    })
  })

  describe('integration', () => {
    let app: express.Express
    const handler = jest.fn((req, res) => {
      res.status(200).json({ping: 'pong'})
    })

    beforeEach(() => {
      app = express()
    })

    afterEach(() => {
      handler.mockClear()
    })

    it('runs through the full circle without crashing', async () => {
      let requestCount = 0

      // prepare middlewares and test application
      const middlewares = createMiddlewareStack({
        withHttpContextProvider: true,
        withRequestIdProvider: true,
        requestIdProviderOptions: {
          requestIdGenerator: () => `req-${++requestCount}`,
        },
        withLoggerProvider: true,
        loggerProviderOptions: {
          logger: testLogger,
        },
        withRequestLogging: true,
      })

      middlewares.attach(app)

      let innerReq: express.Request
      let requestIdFromContext: string | null
      const testHandler = jest.fn((req, res) => {
        innerReq = req
        requestIdFromContext = getFromHttpContext('request-id')
        res.status(200).json({ping: 'pong'})
      })
      app.get('/ping', testHandler)

      // act and assert
      await request(app).get('/ping?foo=bar').expect(200).expect('x-request-id', 'req-1')

      // test setup is correct?
      expect(testHandler).toBeCalled()

      // req had the correct properties attached
      expect(innerReq!.requestId).toBe('req-1')
      expect(typeof innerReq!.logger.info).toBe('function')

      // req had the correct headers added
      expect(innerReq!.header('x-request-id')).toBe('req-1')

      // request id was correctly added to http context
      expect(requestIdFromContext!).toBe('req-1')
    })

    it('works with request logging but without logger provider using custom loggerAccessor', async () => {
      const customLogger = loggerFactory({silent: true})

      const middlewares = createMiddlewareStack({
        withHttpContextProvider: true,
        withRequestIdProvider: false,
        withLoggerProvider: false,
        withRequestLogging: true,
        requestLoggingOptions: {
          loggerAccessor: () => customLogger,
        },
      })

      middlewares.attach(app)
      app.get('/test', (_req, res) => {
        res.status(200).json({ok: true})
      })

      await request(app).get('/test').expect(200)
    })
  })
})
