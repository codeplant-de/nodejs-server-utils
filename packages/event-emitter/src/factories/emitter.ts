// eslint-disable-next-line import/no-extraneous-dependencies
import EventEmitter2 from 'eventemitter2'
import {ApplicationEventEmitter, ApplicationEvents, UnknownEventMap} from '../types'

export const eventEmitterFactory = <
  EventMap extends UnknownEventMap = ApplicationEvents
>(): ApplicationEventEmitter<EventMap> =>
  new EventEmitter2({}) as unknown as ApplicationEventEmitter<EventMap>
