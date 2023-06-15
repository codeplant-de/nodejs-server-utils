import type {SubscribeToFactoryOptions, SubscribeToOptions} from '@codeplant-de/event-emitter'
import DatabaseEvent from '../../DatabaseEvent'
import {
  CompatibleEventEmitter,
  CustomMethodDecorator,
  DatabaseEventName,
  OperationEventNameFactory,
  HasDefaults,
} from '../../types'
import {
  subscribeToDatabaseEventFactoryDefaultOptions,
  subscribeToDatabaseEventDefaultOptions,
} from './constants'

type ListenerFunc = (event: DatabaseEvent) => void | Promise<void>

export interface InternalSubscribeToDatabaseEventFactoryOptions
  extends SubscribeToFactoryOptions<Record<string, unknown[]>> {
  operationEventNameFactory: OperationEventNameFactory
}

export type SubscribeToDatabaseEventFactoryOptions = HasDefaults<
  InternalSubscribeToDatabaseEventFactoryOptions,
  keyof typeof subscribeToDatabaseEventFactoryDefaultOptions
>

export interface InternalSubscribeToDatabaseEvent
  extends Omit<SubscribeToOptions<Record<string, unknown[]>>, 'emitter'> {
  emitter?: CompatibleEventEmitter
  waitForTransaction: boolean
}

export type SubscribeToDatabaseEventOptions = HasDefaults<
  InternalSubscribeToDatabaseEvent,
  keyof typeof subscribeToDatabaseEventDefaultOptions
>

export type SubscribeToDatabaseEventDecorator = <E extends DatabaseEventName>(
  eventName: E,
  options?: SubscribeToDatabaseEventOptions
) => CustomMethodDecorator<ListenerFunc>
