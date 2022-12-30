import {Writable as WritableStream, WritableOptions} from 'node:stream'
import {transports} from 'winston'

/**
 * Creating a writable stream which can be used as a log sink
 */
export class WritableMemoryStream extends WritableStream {
  private store: Buffer

  constructor(options?: WritableOptions) {
    super(options)

    this.store = Buffer.from('')
  }

  toString(encoding: BufferEncoding = 'utf-8'): string {
    return this.store.toString(encoding)
  }

  // eslint-disable-next-line no-underscore-dangle
  _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
    // our memory store stores things in buffers
    const buffer = Buffer.isBuffer(chunk)
      ? chunk // already is Buffer use it
      : Buffer.from(chunk, encoding)

    this.store = Buffer.concat([this.store, buffer])
    callback()
  }
}

export const createTestOutput = (): [typeof transports.Stream, {toString: () => string}] => {
  const stream = new WritableMemoryStream()

  return [new transports.Stream({stream}), stream]
}
