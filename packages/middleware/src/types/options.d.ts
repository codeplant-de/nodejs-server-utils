import {RequestIdProviderOptions} from '@codeplant-de/request-id-provider-middleware'
import {LoggerProviderOptions} from '@codeplant-de/logger-provider-middleware'
import {RequestLoggingOptions} from '@codeplant-de/request-logging-middleware'

export type ContextProviderDisabledOption = {
  withHttpContextProvider?: false
}

export type ContextProviderEnabledOption = {
  withHttpContextProvider?: true
}

export type ContextProviderOption = ContextProviderDisabledOption | ContextProviderEnabledOption

/**
 * Do not use the request-id-provider-middleware
 */
type RequestIdProviderDisabledOption = {
  withRequestIdProvider: false
  requestIdProviderOptions?: Partial<RequestIdProviderOptions>
}

type RequestIdProviderEnabledOption = {
  withRequestIdProvider?: true
  requestIdProviderOptions?: RequestIdProviderOptions
}

export type RequestIdProviderOption =
  | RequestIdProviderDisabledOption
  | RequestIdProviderEnabledOption

type LoggerProviderDisabledOption = {
  withLoggerProvider: false
  loggerProviderOptions?: Partial<LoggerProviderOptions>
}

type LoggerProviderEnabledOption = {
  withLoggerProvider?: true

  loggerProviderOptions: LoggerProviderOptions
}

export type LoggerProviderOption = LoggerProviderDisabledOption | LoggerProviderEnabledOption

type RequestLoggingDisabledOption = {
  withLoggerProvider?: boolean

  withRequestLogging: false

  requestLoggingOptions?: Partial<RequestLoggingOptions>
}

type RequestLoggingEnabledOption =
  | {
      withLoggerProvider: false

      withRequestLogging?: true

      /**
       * if the logger is not provided via logger provider it must be given as loggerAccessor
       */
      requestLoggingOptions: RequestLoggingOptions
    }
  | {
      withLoggerProvider?: true

      withRequestLogging?: true

      requestLoggingOptions?: Omit<RequestLoggingOptions, 'loggerAccessor'>
    }

export type RequestLoggingOption = RequestLoggingDisabledOption | RequestLoggingEnabledOption

export type CreateMiddlewareStackOptions = ContextProviderOption &
  RequestIdProviderOption &
  LoggerProviderOption &
  RequestLoggingOption
