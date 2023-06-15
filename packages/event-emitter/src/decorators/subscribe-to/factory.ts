import {ApplicationEvents, CustomMethodDecorator, UnknownEventMap} from '../../types'
import {
  InternalSubscribeToFactoryOptions,
  InternalSubscribeToOptions,
  SubscribeToDecorator,
  SubscribeToFactoryOptions,
  SubscribeToOptions,
} from './types'
import {subscribeToFactoryDefaultOptions, subscribeToDefaultOptions} from './constants'

function SubscribeToFactory<EventMap extends UnknownEventMap = ApplicationEvents>(
  globalOptions: SubscribeToFactoryOptions<EventMap>
): SubscribeToDecorator<EventMap> {
  const {container, logger} = {
    ...subscribeToFactoryDefaultOptions,
    ...globalOptions,
  } satisfies InternalSubscribeToFactoryOptions<EventMap>

  return function SubscribeTo<E extends keyof EventMap>(
    eventName: E,
    options: SubscribeToOptions<EventMap> = {}
  ): CustomMethodDecorator<(...args: EventMap[E]) => unknown> {
    const {logging, async, emitter} = {
      ...subscribeToDefaultOptions,
      emitter: globalOptions.emitter,
      ...options,
    } satisfies InternalSubscribeToOptions<EventMap>

    return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
      if (logging) {
        const className: string = target?.constructor?.name ?? 'UnknownClass'

        logger(
          `Adding ${className}.${String(propertyKey)} as ${
            async ? 'async ' : ''
          }subscriber of ${JSON.stringify(eventName)}`
        )
      }

      const maybeInstance = container.get(target.constructor)

      emitter.on(eventName, descriptor.value.bind(maybeInstance), {async})
    }
  }
}

export default SubscribeToFactory
