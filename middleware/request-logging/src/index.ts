import requestLoggingMiddlewareFactory from './request-logging-middleware-factory'

export default requestLoggingMiddlewareFactory

export {
  defaultResponseToMeta,
  defaultRequestToMeta,
  UNKNOWN_INDICATOR,
  FILTERED_INDICATOR,
} from './defaults'

export {mergeFormatters} from './utils'

export type {
  ResponseToMetaFormatter,
  RequestToMetaFormatter,
  DynamicLevelFunction,
} from './types/options'

export type {RequestLoggingOptions} from './request-logging-middleware-factory'
