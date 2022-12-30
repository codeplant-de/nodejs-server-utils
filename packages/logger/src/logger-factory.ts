import {createLogger, format, Logform, Logger, LoggerOptions} from 'winston'
import {devFormat} from './dev-utils'

import transportFactory, {TransportFactoryOptions} from './transport-factory'

export interface LoggerFactoryOptions extends TransportFactoryOptions {
  logLevel?: 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly' | string

  outputFormat?: 'pretty' | 'json'
}

const loggerFactory = ({
  logLevel,
  outputFormat,
  ...restOptions
}: LoggerFactoryOptions = {}): Logger => {
  const winstonOptions = {
    level: logLevel ?? 'debug',
    transports: transportFactory(restOptions),
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

  return createLogger({
    ...winstonOptions,
    format: format.combine(...formats),
  })
}

export default loggerFactory
