import {createLogger, format, Logform, Logger, LoggerOptions} from 'winston'
import {devFormat} from './dev-utils'
import {dynamicMetaFormat} from './format'

import transportFactory, {TransportFactoryOptions} from './transport-factory'

export interface LoggerFactoryOptions extends TransportFactoryOptions {
  // @see https://github.com/winstonjs/winston#logging-levels
  logLevel?: 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly' | string

  outputFormat?: 'pretty' | 'json'

  baseMeta?: object

  dynamicMeta?: () => object
}

const loggerFactory = ({
  logLevel,
  outputFormat,
  baseMeta,
  dynamicMeta,
  ...restOptions
}: LoggerFactoryOptions = {}): Logger => {
  const winstonOptions = {
    level: logLevel ?? 'debug',
    transports: transportFactory(restOptions),
    defaultMeta: baseMeta,
  } satisfies LoggerOptions

  const formats: Logform.Format[] = [
    format.timestamp(),
    format.splat(),
    format.simple(),
    format.json(),
  ]

  if (outputFormat === 'pretty') {
    formats.push(devFormat())
  }

  if (dynamicMeta) {
    // needs to be added at the front to be considered in json format
    formats.unshift(dynamicMetaFormat({metaThunk: dynamicMeta}))
  }

  return createLogger({
    ...winstonOptions,
    format: format.combine(...formats),
  })
}

export default loggerFactory
