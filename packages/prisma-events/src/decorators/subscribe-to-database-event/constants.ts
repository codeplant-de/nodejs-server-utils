import type {
  InternalSubscribeToDatabaseEvent,
  InternalSubscribeToDatabaseEventFactoryOptions,
} from './types'
import {defaultOperationEventNameFactory} from '../../utils'

export const subscribeToDatabaseEventFactoryDefaultOptions = {
  operationEventNameFactory: defaultOperationEventNameFactory,
} satisfies Partial<InternalSubscribeToDatabaseEventFactoryOptions>

export const subscribeToDatabaseEventDefaultOptions = {
  waitForTransaction: true,
} satisfies Partial<InternalSubscribeToDatabaseEvent>
