import type TransportStream from 'winston-transport'
import {transports} from 'winston'
import type {Writable as WritableStream} from 'node:stream'
import {WritableMemoryStream} from './test-utils'

export type TransportFactoryOptions = {
  logFile?: string

  silent?: boolean

  testOutputStream?: WritableStream
}

const transportFactory = ({
  logFile,
  silent,
  testOutputStream,
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
  configuredTransports.push(new Console())

  return configuredTransports
}

export default transportFactory
