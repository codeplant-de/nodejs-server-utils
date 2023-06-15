/* eslint-disable @typescript-eslint/no-unused-vars */
import {eventEmitterFactory} from './emitter'
import {ConcreteEventMap} from '../types'

/**
 * mostly focussing on the type safe aspect here
 */
describe('factories > eventEmitter', () => {
  it('allows to be used without being type safe', () => {
    const emitter = eventEmitterFactory()

    emitter.on('any-event', () => {})

    emitter.emit('another-event')
  })

  it('properly shows type errors if events do not exist', () => {
    const emitter = eventEmitterFactory<{
      'existing-event': []
    }>()

    // @ts-expect-error test event does not exist
    emitter.on('test', () => {})

    // @ts-expect-error event does not exist
    emitter.emit('not-existing-event')
  })

  it('allows passing defined event names', () => {
    const emitter = eventEmitterFactory<{
      'existing-event': []
    }>()

    emitter.on('existing-event', () => {})

    emitter.emit('existing-event')
  })

  it('properly handles type definitions for single arguments', () => {
    const emitter = eventEmitterFactory<{
      'existing-event': [number]
    }>()

    emitter.on('existing-event', (param: number) => {})

    // @ts-expect-error param is defined to be a number
    emitter.on('existing-event', (param: string) => {})

    emitter.emit('existing-event', 2)

    // @ts-expect-error only one argument expected
    emitter.emit('existing-event', 2, 5)

    // @ts-expect-error argument is supposed to be number
    emitter.emit('existing-event', 'string')
  })

  it('properly handles type definitions for multiple arguments', () => {
    const emitter = eventEmitterFactory<{
      'existing-event': [number, string]
    }>()

    emitter.on('existing-event', (p1: number, p2: string) => {})

    // @ts-expect-error param is defined to be a number
    emitter.on('existing-event', (p1: string) => {})

    // @ts-expect-error param is defined to be a number
    emitter.on('existing-event', (p1: number, p2: number) => {})

    emitter.emit('existing-event', 2, 'string')

    // @ts-expect-error only one argument expected
    emitter.emit('existing-event', 2, 5)

    // @ts-expect-error argument is supposed to be number
    emitter.emit('existing-event', 'string')
  })

  it('allows to infer the event map used', () => {
    const emitter = eventEmitterFactory<{
      'existing-event': [number, string]
    }>()

    type M = ConcreteEventMap<typeof emitter>

    const t: M = {
      'existing-event': [3, 'string'],

      // @ts-expect-error event not defined
      'not-existing-event': [],
    }
  })
})
