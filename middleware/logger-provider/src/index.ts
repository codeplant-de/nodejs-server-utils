import type {IncomingMessage as HttpIncomingMessage} from 'node:http'
import type {NextHandleFunction} from 'connect'
import type {Logger} from '@codeplant-de/nodejs-server-logger'

declare module 'http' {
  interface IncomingMessage {
    logger: Logger
  }
}

export type LoggerProviderOptions = {
  logger: Logger

  /**
   * If desired a potentially created child logger can be added to any desired context using this callback
   */
  contextSetter?: (childLogger: Logger) => void

  /**
   * To add custom meta (e.g. a request id) to the logger context (using Logger.child) provide this callback
   * @see Logger.child
   */
  childLoggerMeta?: (req: HttpIncomingMessage) => Record<string, unknown>
}

const loggerProviderMiddlewareFactory =
  ({logger, contextSetter, childLoggerMeta}: LoggerProviderOptions): NextHandleFunction =>
  (req, res, next) => {
    const meta: Record<string, unknown> | undefined =
      typeof childLoggerMeta !== 'undefined' ? childLoggerMeta(req) : undefined

    const childLogger = meta ? logger.child(meta) : logger

    if (typeof contextSetter !== 'undefined') {
      contextSetter(childLogger)
    }

    req.logger = childLogger
    next()
  }

export default loggerProviderMiddlewareFactory
