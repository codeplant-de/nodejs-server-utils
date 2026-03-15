import apolloServerLoggingMiddlewareFactory from './middleware'

const createMockRequest = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  operationName: 'TestQuery',
  variables: {},
  http: {
    headers: new Map(),
  },
  ...overrides,
})

const createMockResponse = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  data: {test: true},
  ...overrides,
})

const invokePlugin = async (
  config: Parameters<typeof apolloServerLoggingMiddlewareFactory>[0],
  {
    request = createMockRequest(),
    response = createMockResponse(),
    contextValue = {},
    errors,
  }: {
    request?: Record<string, unknown>
    response?: Record<string, unknown>
    contextValue?: Record<string, unknown>
    errors?: readonly unknown[]
  } = {}
): Promise<void> => {
  const plugin = apolloServerLoggingMiddlewareFactory(config as any)
  const listener = await plugin.requestDidStart!({request} as any)
  await (listener as any).willSendResponse!({
    request,
    response,
    contextValue,
    errors,
  })
}

describe('apolloServerLoggingMiddlewareFactory', () => {
  const testLogger = {log: jest.fn()}

  afterEach(() => {
    testLogger.log.mockClear()
  })

  it('returns a plugin with requestDidStart', () => {
    const plugin = apolloServerLoggingMiddlewareFactory({
      loggerAccessor: () => testLogger,
    } as any)

    expect(plugin.requestDidStart).toBeDefined()
    expect(typeof plugin.requestDidStart).toBe('function')
  })

  it('logs a successful request through the full lifecycle', async () => {
    await invokePlugin({loggerAccessor: () => testLogger} as any)

    expect(testLogger.log).toBeCalledWith(
      expect.objectContaining({
        level: 'info',
        message: '-> GQL: processed TestQuery',
        meta: expect.objectContaining({
          duration: expect.any(Number),
          req: expect.objectContaining({
            operationName: 'TestQuery',
          }),
        }),
      })
    )
  })

  it('logs an error request with error level and error message', async () => {
    const errors = [{message: 'Something broke', extensions: {code: 'INTERNAL_ERROR'}}]

    await invokePlugin({loggerAccessor: () => testLogger} as any, {errors})

    expect(testLogger.log).toBeCalledWith(
      expect.objectContaining({
        level: 'error',
        message: '-X GQL: "INTERNAL_ERROR" error while processing TestQuery',
      })
    )
  })

  it('includes error meta in output', async () => {
    const errors = [{message: 'fail', extensions: {code: 'BAD'}}]

    await invokePlugin({loggerAccessor: () => testLogger} as any, {errors})

    const logCall = testLogger.log.mock.calls[0][0]
    expect(logCall.meta.err).toBeDefined()
    expect(logCall.meta.err).toHaveLength(1)
    expect(logCall.meta.err[0]).toEqual(expect.objectContaining({message: 'fail'}))
  })

  it('uses level as a string override', async () => {
    await invokePlugin({loggerAccessor: () => testLogger, level: 'warn'} as any)

    expect(testLogger.log).toBeCalledWith(expect.objectContaining({level: 'warn'}))
  })

  it('uses level as a function', async () => {
    const levelFn = jest.fn().mockReturnValue('debug')

    await invokePlugin({loggerAccessor: () => testLogger, level: levelFn} as any)

    expect(levelFn).toBeCalled()
    expect(testLogger.log).toBeCalledWith(expect.objectContaining({level: 'debug'}))
  })

  it('includes baseMeta in output', async () => {
    await invokePlugin({
      loggerAccessor: () => testLogger,
      baseMeta: {service: 'gql-api', version: '2.0'},
    } as any)

    const logCall = testLogger.log.mock.calls[0][0]
    expect(logCall.meta.service).toBe('gql-api')
    expect(logCall.meta.version).toBe('2.0')
  })

  it('uses custom metaField name', async () => {
    await invokePlugin({loggerAccessor: () => testLogger, metaField: 'data'} as any)

    const logCall = testLogger.log.mock.calls[0][0]
    expect(logCall.data).toBeDefined()
    expect(logCall.meta).toBeUndefined()
  })

  it('flattens meta to root when metaField is null', async () => {
    await invokePlugin({loggerAccessor: () => testLogger, metaField: null} as any)

    const logCall = testLogger.log.mock.calls[0][0]
    expect(logCall.meta).toBeUndefined()
    expect(logCall.duration).toBeDefined()
    expect(logCall.req).toBeDefined()
  })

  it('uses custom reqField and resField names', async () => {
    await invokePlugin({
      loggerAccessor: () => testLogger,
      reqField: 'request',
      resField: 'response',
      responseToMeta: () => ({status: 'ok'}),
    } as any)

    const logCall = testLogger.log.mock.calls[0][0]
    expect(logCall.meta.request).toBeDefined()
    expect(logCall.meta.response).toBeDefined()
    expect(logCall.meta.req).toBeUndefined()
    expect(logCall.meta.res).toBeUndefined()
  })

  it('uses custom errField name', async () => {
    const errors = [{message: 'fail'}]

    await invokePlugin({loggerAccessor: () => testLogger, errField: 'errors'} as any, {errors})

    const logCall = testLogger.log.mock.calls[0][0]
    expect(logCall.meta.errors).toBeDefined()
    expect(logCall.meta.err).toBeUndefined()
  })

  it('disables request meta when requestToMeta is false', async () => {
    await invokePlugin({loggerAccessor: () => testLogger, requestToMeta: false} as any)

    const logCall = testLogger.log.mock.calls[0][0]
    expect(logCall.meta.req).toBeUndefined()
  })

  it('disables response meta when responseToMeta is false', async () => {
    await invokePlugin({loggerAccessor: () => testLogger, responseToMeta: false} as any)

    const logCall = testLogger.log.mock.calls[0][0]
    expect(logCall.meta.res).toBeUndefined()
  })

  it('disables context meta when contextToMeta is false', async () => {
    await invokePlugin({loggerAccessor: () => testLogger, contextToMeta: false} as any)

    const logCall = testLogger.log.mock.calls[0][0]
    expect(logCall.meta.ctx).toBeUndefined()
  })

  it('disables error meta when errorToMeta is false', async () => {
    const errors = [{message: 'fail'}]

    await invokePlugin({loggerAccessor: () => testLogger, errorToMeta: false} as any, {errors})

    const logCall = testLogger.log.mock.calls[0][0]
    expect(logCall.meta.err).toBeUndefined()
  })

  it('includes contextToMeta data when provided', async () => {
    await invokePlugin({
      loggerAccessor: () => testLogger,
      contextToMeta: () => ({userId: 'user-42'}),
    } as any)

    const logCall = testLogger.log.mock.calls[0][0]
    expect(logCall.meta.ctx).toStrictEqual({userId: 'user-42'})
  })

  it('uses custom messageTemplate', async () => {
    await invokePlugin({
      loggerAccessor: () => testLogger,
      messageTemplate: (req: any) => `Custom: ${req.operationName}`,
    } as any)

    expect(testLogger.log).toBeCalledWith(expect.objectContaining({message: 'Custom: TestQuery'}))
  })

  it('suppresses logging when messageTemplate returns undefined', async () => {
    await invokePlugin({
      loggerAccessor: () => testLogger,
      messageTemplate: () => undefined,
    } as any)

    expect(testLogger.log).not.toBeCalled()
  })

  it('calculates duration using timestampAccessor and timestampFormatter', async () => {
    let callCount = 0

    await invokePlugin({
      loggerAccessor: () => testLogger,
      timestampAccessor: () => {
        callCount += 1
        return callCount === 1 ? 100 : 150
      },
      timestampFormatter: (d: number) => d * 2,
    } as any)

    const logCall = testLogger.log.mock.calls[0][0]
    expect(logCall.meta.duration).toBe(100) // (150 - 100) * 2
  })
})
