import type {Logger} from 'winston'
// eslint-disable-next-line import/no-unresolved
import {expectNotAssignable, expectAssignable} from 'tsd'
import type {RequestLoggingOptions} from '@codeplant-de/request-logging-middleware'
import type {LoggerProviderOptions} from '@codeplant-de/logger-provider-middleware'
import {
  RequestLoggingOption,
  LoggerProviderOption,
  RequestIdProviderOption,
  ContextProviderOption,
  CreateMiddlewareStackOptions,
} from './options'

const logger = {} as Logger

const minimalLoggerProviderOptions = {logger}

const minimalRequestLoggingOptions = {
  loggerAccessor: (): Logger => logger,
}

expectAssignable<LoggerProviderOptions>(minimalLoggerProviderOptions)

expectAssignable<RequestLoggingOptions<unknown, unknown>>(minimalRequestLoggingOptions)

/**
 * ContextProviderOption
 */
// all properties are optional no matter if enabled or disabled
expectAssignable<ContextProviderOption>({})

expectAssignable<ContextProviderOption>({
  withHttpContextProvider: true,
})

expectAssignable<ContextProviderOption>({
  withHttpContextProvider: false,
})

/**
 * RequestIdProviderOption
 */
// all properties are optional
expectAssignable<RequestIdProviderOption>({})

// can be disabled
expectAssignable<RequestIdProviderOption>({
  withRequestIdProvider: false,
})

// can be enabled
expectAssignable<RequestIdProviderOption>({
  withRequestIdProvider: true,
})

/**
 * LoggerProviderOption
 */
// is enabled by default and requires a logger to be passed
expectAssignable<LoggerProviderOption>({
  loggerProviderOptions: {logger},
})

// if not disabled we have to provide the logger
expectNotAssignable<LoggerProviderOption>({})

// can be disabled, does not require options to be passed anymore
expectAssignable<LoggerProviderOption>({
  withLoggerProvider: false,
})

// when explicitly enabled requires a logger to be passed
expectAssignable<LoggerProviderOption>({
  withLoggerProvider: true,
  loggerProviderOptions: {logger},
})

expectNotAssignable<LoggerProviderOption>({
  withLoggerProvider: true,
})

/**
 * RequestIdProviderOption
 */
// all properties are optional no matter if enabled or disabled
expectAssignable<RequestIdProviderOption>({})

expectAssignable<RequestIdProviderOption>({
  withRequestIdProvider: true,
})
expectAssignable<RequestIdProviderOption>({
  withRequestIdProvider: false,
})

/**
 * RequestLoggingOption
 */
// all properties are optional by default
expectAssignable<RequestLoggingOption<unknown, unknown>>({})

// can be disabled
expectAssignable<RequestLoggingOption<unknown, unknown>>({
  withRequestLogging: false,
})

// is not allowed to pass a loggerAccessor by default
expectNotAssignable<RequestLoggingOption<unknown, unknown>>({
  requestLoggingOptions: {
    loggerAccessor: () => logger,
  },
})

// is not allowed to pass a loggerAccessor if enabled
expectNotAssignable<RequestLoggingOption<unknown, unknown>>({
  requestLoggingOptions: {
    loggerAccessor: () => logger,
  },
})

// have to pass a loggerAccessor if loggerProvider is disabled
expectNotAssignable<RequestLoggingOption<unknown, unknown>>({
  withLoggerProvider: false,
})
expectAssignable<RequestLoggingOption<unknown, unknown>>({
  withLoggerProvider: false,
  requestLoggingOptions: {
    loggerAccessor: () => logger,
  },
})
expectNotAssignable<RequestLoggingOption<unknown, unknown>>({
  withLoggerProvider: false,
  withRequestLogging: true,
})

// when loggerProvider and requestLogging is disabled we don't need to pass anything
expectAssignable<RequestLoggingOption<unknown, unknown>>({
  withLoggerProvider: false,
  withRequestLogging: false,
})

/**
 * CreateMiddlewareStackOptions
 */
// only logger is required by default
expectAssignable<CreateMiddlewareStackOptions<unknown, unknown>>({
  loggerProviderOptions: minimalLoggerProviderOptions,
})
expectNotAssignable<CreateMiddlewareStackOptions<unknown, unknown>>({})

// when the loggerProvider is disabled the requestLogger needs its loggerAccessor to be defined
expectAssignable<CreateMiddlewareStackOptions<unknown, unknown>>({
  withLoggerProvider: false,
  requestLoggingOptions: minimalRequestLoggingOptions,
})
expectNotAssignable<CreateMiddlewareStackOptions<unknown, unknown>>({
  withLoggerProvider: false,
})

// if both the loggerProvider & requestLogger are disabled no further config must be passed
expectAssignable<CreateMiddlewareStackOptions<unknown, unknown>>({
  withLoggerProvider: false,
  withRequestLogging: false,
})
