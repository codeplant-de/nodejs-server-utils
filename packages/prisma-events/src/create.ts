import type {PrismaClient} from '@prisma/client'
import {PrismaEventsOptions} from './types'
import {assignDefaultOptions, filterUndefined} from './utils'
import {clientProxyFactory, extensionFactory} from './factories'
import {
  SubscribeToDatabaseEventDecorator,
  SubscribeToDatabaseEventFactory,
  SubscribeToDatabaseEventFactoryOptions,
} from './decorators'

type ApplyToClientFn = <C extends PrismaClient>(client: C) => C

function create(options: PrismaEventsOptions & SubscribeToDatabaseEventFactoryOptions): {
  applyToClient: ApplyToClientFn
  SubscribeToDatabaseEvent: SubscribeToDatabaseEventDecorator
} {
  const internalOptions = assignDefaultOptions(options)

  const extension = extensionFactory(internalOptions)

  return {
    applyToClient: <C extends PrismaClient>(client: C): C => {
      const clientProxy = clientProxyFactory(internalOptions)
      const extendedClient = client.$extends(extension)
      return clientProxy(extendedClient) as C
    },
    SubscribeToDatabaseEvent: SubscribeToDatabaseEventFactory(
      filterUndefined({
        operationEventNameFactory: internalOptions.operationEventNameFactory,
        emitter: internalOptions.emitter,
        container: internalOptions.container,
        logger: internalOptions?.logger?.silly,
      })
    ),
  }
}

export default create
