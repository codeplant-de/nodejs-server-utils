import {Writable as WritableStream} from 'node:stream'
import {LogLevel} from '../types/logger'

export interface LoggerFactoryOptions {
  // @see https://github.com/winstonjs/winston#logging-levels
  logLevel?: LogLevel

  outputFormat?: 'pretty' | 'json'

  baseMeta?: object

  dynamicMeta?: () => object

  silent?: boolean

  testOutputStream?: WritableStream
}
