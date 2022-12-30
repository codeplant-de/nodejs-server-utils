import {createMocks} from 'node-mocks-http'

import requestIdProviderMiddlewareFactory, {DEFAULT_REQUEST_ID_HEADER} from './index'

describe('requestIdProviderMiddlewareFactory', () => {
  it('adds a requestId to the req object', () => {
    const requestIdProvider = requestIdProviderMiddlewareFactory()

    const {req, res} = createMocks()
    const next = jest.fn()

    expect(req.requestId).toBeUndefined()

    requestIdProvider(req, res, next)

    expect(next).toBeCalled()
    expect(req.requestId).toBeTruthy()
  })

  it('reuses the id passed via headers if readFromRequest is true', () => {
    const requestIdProvider = requestIdProviderMiddlewareFactory({readFromRequest: true})

    const {req, res} = createMocks({headers: {[DEFAULT_REQUEST_ID_HEADER]: 'test-id'}})

    requestIdProvider(req, res, jest.fn())

    expect(req.requestId).toBe('test-id')
  })

  it('ignores the id passed via headers if readFromRequest is false', () => {
    const requestIdProvider = requestIdProviderMiddlewareFactory({readFromRequest: false})

    const {req, res} = createMocks({headers: {[DEFAULT_REQUEST_ID_HEADER]: 'test-id'}})

    requestIdProvider(req, res, jest.fn())

    expect(req.requestId).not.toBe('test-id')
  })

  it('reads the headers requestId from a different header name if passed via requestIdHeaderName', () => {
    const requestIdProvider = requestIdProviderMiddlewareFactory({
      readFromRequest: true,
      requestIdHeaderName: 'x-test-header',
    })

    const {req, res} = createMocks({headers: {'x-test-header': 'test-id'}})

    requestIdProvider(req, res, jest.fn())

    expect(req.requestId).toBe('test-id')
  })

  it('uses the custom requestIdGenerator if passed', () => {
    const requestIdProvider = requestIdProviderMiddlewareFactory({
      requestIdGenerator: () => 'not-a-random-id',
    })

    const {req, res} = createMocks()

    requestIdProvider(req, res, jest.fn)

    expect(req.requestId).toBe('not-a-random-id')
  })

  it('provides the newly created requestId to the callback passed via contextSetter', () => {
    let setViaCallback: string | undefined

    const requestIdProvider = requestIdProviderMiddlewareFactory({
      contextSetter: requestId => (setViaCallback = requestId),
    })

    const {req, res} = createMocks()

    requestIdProvider(req, res, jest.fn())

    expect(setViaCallback).toBeTruthy()
    expect(req.requestId).toBe(setViaCallback)
  })

  describe('bad input', () => {
    it('handles headers properly which contain arrays', () => {
      const requestIdProvider = requestIdProviderMiddlewareFactory({readFromRequest: true})

      const {req, res} = createMocks({headers: {[DEFAULT_REQUEST_ID_HEADER]: ['test-id']}})

      requestIdProvider(req, res, jest.fn())

      expect(req.requestId).toBe('test-id')
    })
  })
})
