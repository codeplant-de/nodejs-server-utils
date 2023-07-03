import type TransportStream from 'winston-transport'
import {transports} from 'winston'
import type {Writable as WritableStream} from 'node:stream'
import {WritableMemoryStream} from './test-utils'

export type TransportFactoryOptions = {
  logFile?: string

  silent?: boolean

  console?: boolean

  customLogTransport?: TransportStream

  testOutputStream?: WritableStream
}

const transportFactory = ({
  logFile,
  silent,
  testOutputStream,
  console,
  customLogTransport,
}: TransportFactoryOptions = {}): TransportStream[] => {
  const {Stream, Console, File} = transports
  const configuredTransports: TransportStream[] = []
  if (silent) {
    return [
      new Stream({
        stream: testOutputStream ?? new WritableMemoryStream(),
      }),
    ]
  }
  if (logFile) {
    configuredTransports.push(new File({filename: logFile}))
  }
  if (console !== false) {
    configuredTransports.push(new Console())
  }
  if (customLogTransport) {
    configuredTransports.push(customLogTransport)
  }

  return configuredTransports
}

export default transportFactory
