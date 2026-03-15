import {createMocks} from 'node-mocks-http'

import loggerProviderMiddlewareFactory from './index'

const createMockLogger = () => {
  const childLogger = {child: jest.fn()}
  const logger = {child: jest.fn().mockReturnValue(childLogger)}
  return {logger, childLogger}
}

describe('loggerProviderMiddlewareFactory', () => {
  it('attaches the logger to req.logger when no childLoggerMeta is provided', () => {
    const {logger} = createMockLogger()
    const loggerProvider = loggerProviderMiddlewareFactory({logger} as any)

    const {req, res} = createMocks()
    const next = jest.fn()

    loggerProvider(req, res, next)

    expect(req.logger).toBe(logger)
  })

  it('calls next() after setting up the logger', () => {
    const {logger} = createMockLogger()
    const loggerProvider = loggerProviderMiddlewareFactory({logger} as any)

    const {req, res} = createMocks()
    const next = jest.fn()

    loggerProvider(req, res, next)

    expect(next).toBeCalled()
  })

  it('creates a child logger with meta when childLoggerMeta is provided', () => {
    const {logger, childLogger} = createMockLogger()
    const meta = {requestId: '123'}
    const loggerProvider = loggerProviderMiddlewareFactory({
      logger,
      childLoggerMeta: () => meta,
    } as any)

    const {req, res} = createMocks()
    const next = jest.fn()

    loggerProvider(req, res, next)

    expect(logger.child).toBeCalledWith(meta)
    expect(req.logger).toBe(childLogger)
  })

  it('calls contextSetter with the child logger when childLoggerMeta is provided', () => {
    const {logger, childLogger} = createMockLogger()
    const contextSetter = jest.fn()
    const loggerProvider = loggerProviderMiddlewareFactory({
      logger,
      contextSetter,
      childLoggerMeta: () => ({requestId: '123'}),
    } as any)

    const {req, res} = createMocks()
    const next = jest.fn()

    loggerProvider(req, res, next)

    expect(contextSetter).toBeCalledWith(childLogger)
  })

  it('calls contextSetter with the parent logger when no childLoggerMeta is provided', () => {
    const {logger} = createMockLogger()
    const contextSetter = jest.fn()
    const loggerProvider = loggerProviderMiddlewareFactory({
      logger,
      contextSetter,
    } as any)

    const {req, res} = createMocks()
    const next = jest.fn()

    loggerProvider(req, res, next)

    expect(contextSetter).toBeCalledWith(logger)
  })

  it('does not call logger.child when no childLoggerMeta is provided', () => {
    const {logger} = createMockLogger()
    const loggerProvider = loggerProviderMiddlewareFactory({logger} as any)

    const {req, res} = createMocks()

    loggerProvider(req, res, jest.fn())

    expect(logger.child).not.toBeCalled()
  })

  it('creates independent child loggers for separate requests', () => {
    const {logger} = createMockLogger()
    const childLoggerMeta = jest.fn().mockReturnValue({requestId: '123'})
    const loggerProvider = loggerProviderMiddlewareFactory({
      logger,
      childLoggerMeta,
    } as any)

    const {req: req1, res: res1} = createMocks()
    const {req: req2, res: res2} = createMocks()

    loggerProvider(req1, res1, jest.fn())
    loggerProvider(req2, res2, jest.fn())

    expect(logger.child).toBeCalledTimes(2)
  })

  it('does not call contextSetter when it is not provided', () => {
    const {logger} = createMockLogger()
    const loggerProvider = loggerProviderMiddlewareFactory({logger} as any)

    const {req, res} = createMocks()
    const next = jest.fn()

    expect(() => loggerProvider(req, res, next)).not.toThrow()
  })

  it('passes the request object to childLoggerMeta callback', () => {
    const {logger} = createMockLogger()
    const childLoggerMeta = jest.fn().mockReturnValue({})
    const loggerProvider = loggerProviderMiddlewareFactory({
      logger,
      childLoggerMeta,
    } as any)

    const {req, res} = createMocks()
    const next = jest.fn()

    loggerProvider(req, res, next)

    expect(childLoggerMeta).toBeCalledWith(req)
  })
})
