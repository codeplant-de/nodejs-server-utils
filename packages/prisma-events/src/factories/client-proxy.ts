import type {PrismaClient} from '@prisma/client'
import {InternalPrismaEventsOptions} from '../types'
import clientProxy from '../proxies/client'

type ClientProxyFactoryOptions = Pick<
  InternalPrismaEventsOptions,
  'transactionEventNameFactory' | 'logger'
> & {
  emitter: Pick<InternalPrismaEventsOptions['emitter'], 'emit'>
}

const clientProxyFactory = (
  options: ClientProxyFactoryOptions
): (<C extends Partial<PrismaClient>>(client: C) => C) => {
  const {emitter, logger, transactionEventNameFactory} = options

  const emit = (action: string, txId: string): void => {
    const eventNameToEmit = transactionEventNameFactory(action, txId)

    logger?.silly(`Emitting event: ${eventNameToEmit}`)
    emitter.emit(eventNameToEmit)
  }

  return <C extends Partial<PrismaClient>>(client: C): C => clientProxy(emit, client)
}

export default clientProxyFactory
