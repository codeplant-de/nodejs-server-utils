import {
  ContextProviderEnabledOption,
  ContextProviderOption,
  LoggerProviderEnabledOption,
  LoggerProviderOption,
  RequestIdProviderEnabledOption,
  RequestIdProviderOption,
  RequestLoggingEnabledOption,
  RequestLoggingOption,
} from './types/options'

export const isEnabledContextProviderOption = (
  options: ContextProviderOption
): options is ContextProviderEnabledOption => options.withHttpContextProvider === true

export const isEnabledRequestIdProviderOption = (
  options: RequestIdProviderOption
): options is RequestIdProviderEnabledOption => options.withRequestIdProvider === true

export const isEnabledLoggerProviderOption = (
  options: LoggerProviderOption
): options is LoggerProviderEnabledOption => options.withLoggerProvider === true

export const isEnabledRequestLoggingOption = (
  options: RequestLoggingOption
): options is RequestLoggingEnabledOption => options.withRequestLogging === true
