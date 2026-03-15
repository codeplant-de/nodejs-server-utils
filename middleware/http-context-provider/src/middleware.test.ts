import {createMocks} from 'node-mocks-http'
import httpContextMiddleware from './middleware'
import {getFromHttpContext, storeInHttpContext} from './read-write'
import {getContextStorage} from './context'

describe('httpContextMiddleware', () => {
  test('calls next', done => {
    const {req, res} = createMocks()

    httpContextMiddleware(req, res, () => {
      done()
    })
  })

  test('initializes a context storage that is available in next', done => {
    const {req, res} = createMocks()

    httpContextMiddleware(req, res, () => {
      expect(getContextStorage()).toBeDefined()
      done()
    })
  })

  test('context storage is empty when initialized', done => {
    const {req, res} = createMocks()

    httpContextMiddleware(req, res, () => {
      expect(getContextStorage()?.size).toBe(0)
      done()
    })
  })

  test('allows storing and retrieving values within the middleware chain', done => {
    const {req, res} = createMocks()

    httpContextMiddleware(req, res, () => {
      storeInHttpContext('requestId', '123')

      expect(getFromHttpContext('requestId')).toBe('123')
      done()
    })
  })

  test('context is not available outside the middleware chain', done => {
    const {req, res} = createMocks()

    httpContextMiddleware(req, res, () => {
      storeInHttpContext('foo', 'bar')
      done()
    })

    expect(getFromHttpContext('foo')).toBeNull()
  })

  test('each request gets its own isolated context', done => {
    const {req: req1, res: res1} = createMocks()
    const {req: req2, res: res2} = createMocks()

    let request1Done = false
    let request2Done = false

    const checkDone = (): void => {
      if (request1Done && request2Done) {
        done()
      }
    }

    httpContextMiddleware(req1, res1, () => {
      storeInHttpContext('source', 'request1')

      expect(getFromHttpContext('source')).toBe('request1')
      request1Done = true
      checkDone()
    })

    httpContextMiddleware(req2, res2, () => {
      storeInHttpContext('source', 'request2')

      expect(getFromHttpContext('source')).toBe('request2')
      request2Done = true
      checkDone()
    })
  })

  test('context persists across async operations', done => {
    const {req, res} = createMocks()

    httpContextMiddleware(req, res, async () => {
      storeInHttpContext('before', 'async')

      await new Promise<void>(resolve => {
        setTimeout(resolve, 10)
      })

      expect(getFromHttpContext('before')).toBe('async')
      done()
    })
  })

  test('supports storing symbol keys within the middleware context', done => {
    const {req, res} = createMocks()
    const key = Symbol('traceId')

    httpContextMiddleware(req, res, () => {
      storeInHttpContext(key, 'trace-abc')

      expect(getFromHttpContext(key)).toBe('trace-abc')
      done()
    })
  })

  test('supports storing multiple values within the same request context', done => {
    const {req, res} = createMocks()

    httpContextMiddleware(req, res, () => {
      storeInHttpContext('user', 'alice')
      storeInHttpContext('role', 'admin')
      storeInHttpContext('requestId', 'req-456')

      expect(getFromHttpContext('user')).toBe('alice')
      expect(getFromHttpContext('role')).toBe('admin')
      expect(getFromHttpContext('requestId')).toBe('req-456')
      done()
    })
  })
})
