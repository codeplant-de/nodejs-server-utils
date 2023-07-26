import apolloServerLoggingMiddlewareFactory from './middleware'

export default apolloServerLoggingMiddlewareFactory

export {defaultConfig} from './middleware'
export * from './constants'
export * from './defaults'
export * from './utils'

export type {ApolloServerLoggingConfig} from './middleware'
export type {Config} from './types/config'
export type {
  MessageTemplate,
  SkipFunction,
  ErrorToMetaFormatter,
  ErrorMessageTemplate,
  ContextToMetaFormatter,
  ResponseToMetaFormatter,
  RequestToMetaFormatter,
  DynamicLevelFunction,
  TimestampFormatter,
  TimestampAccessor,
} from './defaults'
