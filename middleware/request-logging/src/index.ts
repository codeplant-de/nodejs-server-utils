import requestLoggingMiddlewareFactory from './middleware-factory'

export default requestLoggingMiddlewareFactory

export * from './defaults'
export * from './constants'

export {mergeFormatters} from './utils'

export type {RequestLoggingOptions} from './middleware-factory'
