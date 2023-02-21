import apolloServerLoggingMiddlewareFactory from './middleware'

export default apolloServerLoggingMiddlewareFactory

export {defaultConfig} from './middleware'
export * from './constants'
export * from './defaults'
export * from './utils'

export type {ApolloServerLoggingConfig} from './middleware'
export type {
  MessageTemplate,
  ErrorMessageTemplate,
  ErrorToMetaFormatter,
  ContextToMetaFormatter,
  RequestToMetaFormatter,
  DynamicLevelFunction,
  ResponseToMetaFormatter,
  SkipFunction,
  Config,
} from './types/config'
