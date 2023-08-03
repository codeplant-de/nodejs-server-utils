import pino from 'pino'
import pinoPretty from 'pino-pretty'
import {LogEntry, Logger, LogLevel} from '../types/logger'
import {WritableMemoryStream} from '../test-utils/WritableMemoryStream'
import {LoggerFactoryOptions} from './types'
import {formatLikeWinston} from '../format'

const loggerFactory = ({
  baseMeta,
  dynamicMeta,
  logLevel,
  outputFormat,
  silent,
  testOutputStream,
}: LoggerFactoryOptions = {}): Logger => {
  // mixin
  let mixin
  if (dynamicMeta) {
    mixin = () => dynamicMeta()
  }

  const destination = (() => {
    if (silent) {
      if (testOutputStream) {
        return testOutputStream
      }
      return new WritableMemoryStream()
    }
    if (outputFormat === 'pretty') {
      return pinoPretty({
        sync: true,
        messageKey: 'message',
        timestampKey: 'timestamp',
        minimumLevel: 'trace',
        singleLine: true,
      })
    }
    return pino.destination(1)
  })()

  const logger = pino(
    {
      base: baseMeta,
      timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
      mixin,
      level: logLevel ?? 'info',
      formatters: {
        level: label => ({
          level: label,
        }),
      },
      hooks: {
        logMethod(inputArgs, method) {
          // hot path optimization
          if (typeof inputArgs[0] === 'object') {
            // already pino format
            return method.apply(this, inputArgs)
          }

          const [message, meta] = formatLikeWinston.apply(this, inputArgs)

          // @ts-expect-error don't know, don't care
          return method.call(this, meta, message)
        },
      },
      messageKey: 'message',
    },
    destination
  )

  Object.defineProperty(logger, 'log', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: function log(
      this: typeof logger,
      level: LogLevel | string | LogEntry<LogLevel | string>,
      message?: string,
      ...restArgs: any[]
    ) {
      const methodName = typeof level === 'string' ? level : level.level
      if (methodName in this) {
        if (typeof level === 'object') {
          return this[methodName as LogLevel](level, message, ...restArgs)
        }
        return this[methodName as LogLevel](message, ...restArgs)
      }
      throw new Error(`invalid log level: ${methodName}`)
    },
  })

  if (process.env.NODE_ENV === 'test' && silent === true) {
    // expose the output
    Object.defineProperty(logger, '_output', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: destination,
    })
  }

  // @ts-expect-error type is still wrong
  return logger
}

export default loggerFactory
