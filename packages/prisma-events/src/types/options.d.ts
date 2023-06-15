import {AllowOrBlockDefinition} from './allow-or-block'
import {HasDefaults} from './utils'

export type CompatibleEventEmitter = {
  once: (eventName: string, cb: () => void) => void
  on: (eventName: string, cb: () => void) => void
  emit: (eventName: string, ...eventArgs: any[]) => void
}

export type LogWriter = (m: string) => void

export type OperationEventNameFactory = (model: string | undefined, operation: string) => string

export type TransactionEventNameFactory = (action: string, txId: string) => string

export type InternalPrismaEventsOptions = {
  emitter: CompatibleEventEmitter
  logger?: {error: LogWriter; silly: LogWriter}
  operationEventNameFactory: OperationEventNameFactory
  transactionEventNameFactory: TransactionEventNameFactory
  blockList?: AllowOrBlockDefinition[]
  allowList?: AllowOrBlockDefinition[]
  includeResult?: boolean
  rethrowEmitErrors?: boolean
}

export type PrismaEventsOptions = HasDefaults<
  InternalPrismaEventsOptions,
  'operationEventNameFactory' | 'transactionEventNameFactory'
>
