import {SubscribeToFactory, SubscribeToOptions} from '@codeplant-de/event-emitter'
import {CustomMethodDecorator, DatabaseEventName} from '../../types'
import DatabaseEvent from '../../DatabaseEvent'
import {
  SubscribeToDatabaseEventFactoryOptions,
  InternalSubscribeToDatabaseEventFactoryOptions,
  SubscribeToDatabaseEventOptions,
  ListenerFunc,
  InternalSubscribeToDatabaseEvent,
  SubscribeToDatabaseEventDecorator,
} from './types'
import {
  subscribeToDatabaseEventDefaultOptions,
  subscribeToDatabaseEventFactoryDefaultOptions,
} from './constants'

function SubscribeToDatabaseEventFactory(
  globalOptions: SubscribeToDatabaseEventFactoryOptions
): SubscribeToDatabaseEventDecorator {
  const {operationEventNameFactory} = {
    ...subscribeToDatabaseEventFactoryDefaultOptions,
    ...globalOptions,
  } satisfies InternalSubscribeToDatabaseEventFactoryOptions

  const SubscribeTo = SubscribeToFactory(globalOptions)

  return function SubscribeToDatabaseEvent<E extends DatabaseEventName>(
    eventName: E,
    options: SubscribeToDatabaseEventOptions = {}
  ): CustomMethodDecorator<ListenerFunc> {
    const {waitForTransaction, ...restOptions} = {
      ...subscribeToDatabaseEventDefaultOptions,
      ...options,
    } satisfies InternalSubscribeToDatabaseEvent

    const [model, operation] = eventName.split('.')
    const finalEventName = operationEventNameFactory(model, operation)

    const orgSubscribeTo = SubscribeTo(finalEventName, restOptions as SubscribeToOptions<any>)

    return (
      target: object,
      propertyKey: string | symbol,
      descriptor: TypedPropertyDescriptor<ListenerFunc>
    ): TypedPropertyDescriptor<ListenerFunc> => {
      const orgListenerFunc = descriptor.value

      // early return
      if (!waitForTransaction || !orgListenerFunc) {
        return orgSubscribeTo(
          target,
          propertyKey,
          descriptor as any
        ) as TypedPropertyDescriptor<ListenerFunc>
      }

      function wrappedListener(this: object, event: DatabaseEvent): void | Promise<void> {
        if (event.inTransaction()) {
          // delay in case we are within a transaction
          return event.onTransactionCommit(() => {
            const delayedEvent = new DatabaseEvent({
              args: event.getArgs(),
              result: event.getResult(),
              dataPath: event.getDataPath(),
              transaction: undefined,
              transactionCallbacks: undefined,
            })

            return orgListenerFunc!.call(this, delayedEvent)
          })
        }
        return orgListenerFunc!.call(this, event)
      }
      // eslint-disable-next-line no-param-reassign
      descriptor.value = wrappedListener

      return orgSubscribeTo(
        target,
        propertyKey,
        descriptor as any
      ) as TypedPropertyDescriptor<ListenerFunc>
    }
  }
}

export default SubscribeToDatabaseEventFactory
