import {v4 as uuid, validate} from 'uuid'
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

  it('reuses the id passed via headers if readFromRequest is true and it is not filtered out', () => {
    const requestIdProvider = requestIdProviderMiddlewareFactory({
      readFromRequest: true,
      requestIdFilter: undefined,
    })

    const {req, res} = createMocks({headers: {[DEFAULT_REQUEST_ID_HEADER]: 'test-id'}})

    requestIdProvider(req, res, jest.fn())

    expect(req.requestId).toBe('test-id')
  })

  it('does not filter out valid uuids by default', () => {
    const requestIdProvider = requestIdProviderMiddlewareFactory({
      readFromRequest: true,
    })

    const testId = uuid()
    const {req, res} = createMocks({headers: {[DEFAULT_REQUEST_ID_HEADER]: testId}})

    requestIdProvider(req, res, jest.fn())

    expect(req.requestId).toBe(testId)
  })

  it('ignores the id passed via headers if readFromRequest is false', () => {
    const requestIdProvider = requestIdProviderMiddlewareFactory({
      readFromRequest: false,
      requestIdFilter: undefined,
    })

    const {req, res} = createMocks({headers: {[DEFAULT_REQUEST_ID_HEADER]: 'test-id'}})

    requestIdProvider(req, res, jest.fn())

    expect(req.requestId).not.toBe('test-id')
  })

  it('reads the headers requestId from a different header name if passed via requestIdHeaderName', () => {
    const requestIdProvider = requestIdProviderMiddlewareFactory({
      readFromRequest: true,
      requestIdFilter: undefined,
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

    requestIdProvider(req, res, jest.fn())

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

  it('generates a valid uuid v4 by default', () => {
    const requestIdProvider = requestIdProviderMiddlewareFactory()

    const {req, res} = createMocks()

    requestIdProvider(req, res, jest.fn())

    expect(validate(req.requestId)).toBe(true)
  })

  describe('addToReqHeaders', () => {
    it('adds requestId to request headers by default', () => {
      const requestIdProvider = requestIdProviderMiddlewareFactory()

      const {req, res} = createMocks()

      requestIdProvider(req, res, jest.fn())

      expect(req.headers[DEFAULT_REQUEST_ID_HEADER]).toBe(req.requestId)
    })

    it('does not add requestId to request headers when addToReqHeaders is false', () => {
      const requestIdProvider = requestIdProviderMiddlewareFactory({
        addToReqHeaders: false,
      })

      const {req, res} = createMocks()
      const originalHeaders = {...req.headers}

      requestIdProvider(req, res, jest.fn())

      expect(req.headers[DEFAULT_REQUEST_ID_HEADER]).toBe(
        originalHeaders[DEFAULT_REQUEST_ID_HEADER]
      )
    })

    it('uses the custom header name for request headers', () => {
      const requestIdProvider = requestIdProviderMiddlewareFactory({
        requestIdHeaderName: 'x-correlation-id',
      })

      const {req, res} = createMocks()

      requestIdProvider(req, res, jest.fn())

      expect(req.headers['x-correlation-id']).toBe(req.requestId)
    })
  })

  describe('addToResHeaders', () => {
    it('adds requestId to response headers by default', () => {
      const requestIdProvider = requestIdProviderMiddlewareFactory()

      const {req, res} = createMocks()

      requestIdProvider(req, res, jest.fn())

      expect(res.getHeader(DEFAULT_REQUEST_ID_HEADER)).toBe(req.requestId)
    })

    it('does not add requestId to response headers when addToResHeaders is false', () => {
      const requestIdProvider = requestIdProviderMiddlewareFactory({
        addToResHeaders: false,
      })

      const {req, res} = createMocks()

      requestIdProvider(req, res, jest.fn())

      expect(res.getHeader(DEFAULT_REQUEST_ID_HEADER)).toBeUndefined()
    })

    it('uses the custom header name for response headers', () => {
      const requestIdProvider = requestIdProviderMiddlewareFactory({
        requestIdHeaderName: 'x-correlation-id',
      })

      const {req, res} = createMocks()

      requestIdProvider(req, res, jest.fn())

      expect(res.getHeader('x-correlation-id')).toBe(req.requestId)
    })
  })

  describe('requestIdFilter', () => {
    it('applies a custom filter to incoming request ids', () => {
      const requestIdProvider = requestIdProviderMiddlewareFactory({
        readFromRequest: true,
        requestIdFilter: id => (id.startsWith('valid-') ? id : undefined),
      })

      const {req, res} = createMocks({headers: {[DEFAULT_REQUEST_ID_HEADER]: 'valid-123'}})

      requestIdProvider(req, res, jest.fn())

      expect(req.requestId).toBe('valid-123')
    })

    it('falls through to generator when custom filter rejects the id', () => {
      const requestIdProvider = requestIdProviderMiddlewareFactory({
        readFromRequest: true,
        requestIdFilter: id => (id.startsWith('valid-') ? id : undefined),
      })

      const {req, res} = createMocks({headers: {[DEFAULT_REQUEST_ID_HEADER]: 'invalid-123'}})

      requestIdProvider(req, res, jest.fn())

      expect(req.requestId).not.toBe('invalid-123')
      expect(validate(req.requestId)).toBe(true)
    })
  })

  describe('readFromRequest edge cases', () => {
    it('generates a new id when readFromRequest is true but header is missing', () => {
      const requestIdProvider = requestIdProviderMiddlewareFactory({
        readFromRequest: true,
      })

      const {req, res} = createMocks()

      requestIdProvider(req, res, jest.fn())

      expect(req.requestId).toBeTruthy()
      expect(validate(req.requestId)).toBe(true)
    })

    it('generates a new id when readFromRequest is true and header is empty string', () => {
      const requestIdProvider = requestIdProviderMiddlewareFactory({
        readFromRequest: true,
        requestIdFilter: undefined,
      })

      const {req, res} = createMocks({headers: {[DEFAULT_REQUEST_ID_HEADER]: ''}})

      requestIdProvider(req, res, jest.fn())

      expect(req.requestId).toBeTruthy()
    })
  })

  describe('bad input', () => {
    it('handles headers properly which contain arrays', () => {
      const requestIdProvider = requestIdProviderMiddlewareFactory({
        readFromRequest: true,
        requestIdFilter: undefined,
      })

      const {req, res} = createMocks({headers: {[DEFAULT_REQUEST_ID_HEADER]: ['test-id']}})

      requestIdProvider(req, res, jest.fn())

      expect(req.requestId).toBe('test-id')
    })

    it('handles headers containing bad request id', () => {
      const requestIdProvider = requestIdProviderMiddlewareFactory({readFromRequest: true})

      const {req, res} = createMocks({headers: {[DEFAULT_REQUEST_ID_HEADER]: ['test-id']}})

      requestIdProvider(req, res, jest.fn())

      expect(req.requestId).not.toBe('test-id')
      expect(req.requestId).toEqual(expect.any(String))
    })
  })
})
