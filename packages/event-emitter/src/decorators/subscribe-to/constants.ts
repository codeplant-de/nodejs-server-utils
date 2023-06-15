import type {InternalSubscribeToOptions, InternalSubscribeToFactoryOptions} from './types'
import type {UnknownEventMap} from '../../types'
import {SimpleContainer} from '../../utils'

export const subscribeToDefaultOptions = {
  logging: false,
  async: false,
} satisfies InternalSubscribeToOptions<UnknownEventMap>

export const subscribeToFactoryDefaultOptions = {
  // eslint-disable-next-line no-console
  logger: console.log,
  container: new SimpleContainer(),
} satisfies Partial<InternalSubscribeToFactoryOptions<UnknownEventMap>>
