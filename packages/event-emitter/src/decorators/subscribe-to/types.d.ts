import {
  ApplicationEventEmitter,
  ApplicationEvents,
  ContainerType,
  CustomMethodDecorator,
  HasDefaults,
  UnknownEventMap,
} from '../../types'
import {subscribeToDefaultOptions, subscribeToFactoryDefaultOptions} from './constants'

export interface InternalSubscribeToFactoryOptions<EventMap extends UnknownEventMap> {
  emitter: Pick<ApplicationEventEmitter<EventMap>, 'on'>
  logger: (message: string) => void
  container: ContainerType
}

export type SubscribeToFactoryOptions<EventMap extends UnknownEventMap> = HasDefaults<
  InternalSubscribeToFactoryOptions<EventMap>,
  keyof typeof subscribeToFactoryDefaultOptions
>

export interface InternalSubscribeToOptions<EventMap extends UnknownEventMap> {
  logging: boolean
  async: boolean
  emitter?: Pick<ApplicationEventEmitter<EventMap>, 'on'>
}

export type SubscribeToOptions<EventMap extends UnknownEventMap> = HasDefaults<
  InternalSubscribeToOptions<EventMap>,
  keyof typeof subscribeToDefaultOptions
>

export type SubscribeToDecorator<EventMap extends UnknownEventMap = ApplicationEvents> = <
  E extends keyof EventMap
>(
  eventName: E,
  options?: SubscribeToOptions<EventMap>
) => CustomMethodDecorator<(...args: EventMap[E]) => any>
