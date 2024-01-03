import {type Writable as WritableStream} from 'node:stream'
import {WritableMemoryStream} from './WritableMemoryStream'

export const createTestOutput = (): WritableStream & {
  toString: () => string
  clear: () => void
} => new WritableMemoryStream()
