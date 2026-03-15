import {
  isEnabledContextProviderOption,
  isEnabledRequestIdProviderOption,
  isEnabledLoggerProviderOption,
  isEnabledRequestLoggingOption,
} from './utils'

describe('isEnabledContextProviderOption', () => {
  it('returns false when withHttpContextProvider is false', () => {
    expect(isEnabledContextProviderOption({withHttpContextProvider: false})).toBe(false)
  })

  it('returns true when withHttpContextProvider is true', () => {
    expect(isEnabledContextProviderOption({withHttpContextProvider: true})).toBe(true)
  })

  it('returns false when withHttpContextProvider is undefined', () => {
    expect(isEnabledContextProviderOption({})).toBe(false)
  })
})

describe('isEnabledRequestIdProviderOption', () => {
  it('returns false when withRequestIdProvider is false', () => {
    expect(isEnabledRequestIdProviderOption({withRequestIdProvider: false})).toBe(false)
  })

  it('returns true when withRequestIdProvider is true', () => {
    expect(isEnabledRequestIdProviderOption({withRequestIdProvider: true})).toBe(true)
  })

  it('returns true when withRequestIdProvider is true with custom options', () => {
    expect(
      isEnabledRequestIdProviderOption({
        withRequestIdProvider: true,
        requestIdProviderOptions: {
          requestIdGenerator: () => 'custom-id',
        },
      })
    ).toBe(true)
  })

  it('returns false when withRequestIdProvider is undefined', () => {
    expect(isEnabledRequestIdProviderOption({} as any)).toBe(false)
  })
})

describe('isEnabledLoggerProviderOption', () => {
  it('returns false when withLoggerProvider is false', () => {
    expect(isEnabledLoggerProviderOption({withLoggerProvider: false})).toBe(false)
  })

  it('returns true when withLoggerProvider is true', () => {
    expect(
      isEnabledLoggerProviderOption({
        withLoggerProvider: true,
        loggerProviderOptions: {logger: {info: jest.fn(), error: jest.fn()} as any},
      })
    ).toBe(true)
  })

  it('returns true when withLoggerProvider is true with custom logger options', () => {
    const mockLogger = {info: jest.fn(), error: jest.fn(), warn: jest.fn()}
    expect(
      isEnabledLoggerProviderOption({
        withLoggerProvider: true,
        loggerProviderOptions: {logger: mockLogger as any},
      })
    ).toBe(true)
  })

  it('returns false when withLoggerProvider is undefined', () => {
    expect(isEnabledLoggerProviderOption({} as any)).toBe(false)
  })
})

describe('isEnabledRequestLoggingOption', () => {
  it('returns false when withRequestLogging is false', () => {
    expect(isEnabledRequestLoggingOption({withRequestLogging: false})).toBe(false)
  })

  it('returns true when withRequestLogging is true', () => {
    expect(isEnabledRequestLoggingOption({withRequestLogging: true})).toBe(true)
  })

  it('returns true when withRequestLogging is true with custom options', () => {
    expect(
      isEnabledRequestLoggingOption({
        withRequestLogging: true,
        requestLoggingOptions: {
          loggerAccessor: () => ({info: jest.fn()} as any),
        },
      } as any)
    ).toBe(true)
  })

  it('returns false when withRequestLogging is undefined', () => {
    expect(isEnabledRequestLoggingOption({} as any)).toBe(false)
  })
})
