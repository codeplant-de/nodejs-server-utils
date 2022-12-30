import {loggerFactory} from '@codeplant-de/nodejs-server-logger'
import {getFromHttpContext} from '@codeplant-de/http-context-provider-middleware'
import express from 'express'
import request from 'supertest'

import createMiddlewareStack from './index'

const testLogger = loggerFactory({silent: true})

describe('createMiddlewareStack', () => {
  it('does not add any middlewares if not configured', () => {
    const middlewares = createMiddlewareStack()

    expect(middlewares).toHaveLength(0)
  })

  it('creates and connects all different middlewares', () => {
    const middlewares = createMiddlewareStack({
      withHttpContextProvider: true,
      withRequestIdProvider: true,
      withLoggerProvider: true,
      loggerProviderOptions: {
        logger: testLogger,
      },
    })

    expect(middlewares).toHaveLength(3)
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
      })

      middlewares.attach(app)

      let innerReq: express.Request
      let requestIdFromContext: string
      const testHandler = jest.fn((req, res) => {
        innerReq = req
        // @ts-expect-error needs to be fixed! @todo
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
      expect(innerReq!.logger.info).toBeFunction()

      // req had the correct headers added
      expect(innerReq!.header('x-request-id')).toBe('req-1')

      // request id was correctly added to http context
      expect(requestIdFromContext!).toBe('req-1')
    })
  })
})
