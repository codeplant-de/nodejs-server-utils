/* eslint-disable @typescript-eslint/no-unused-vars */
import {eventEmitterFactory} from '../factories'
import {ApplicationEventEmitter} from '../types'
import {SubscribeToFactory, SubscribeToDecorator} from '../decorators'

declare module '../types' {
  interface ApplicationEvents {
    'some.event': [number]
  }
}

const awaiter = () => {
  let outerResolve: () => void
  let outerReject: () => void
  const prom = new Promise<void>((resolve, reject) => {
    outerResolve = resolve
    outerReject = reject
  })

  return {
    prom,
    // @ts-ignore
    reject: outerReject,
    // @ts-ignore
    resolve: outerResolve,
  }
}

const syncWait = (duration: number): void => {
  const till = Date.now() + duration
  while (Date.now() < till) {
    // just nothing
  }
}

const asyncWait = (duration: number): Promise<void> =>
  new Promise<void>(resolve => {
    setTimeout(() => {
      resolve()
    }, duration)
  })

describe('integration > decorators > subscribe-to', () => {
  let emitter: ApplicationEventEmitter
  let SubscribeTo: SubscribeToDecorator

  beforeEach(() => {
    emitter = eventEmitterFactory()
    SubscribeTo = SubscribeToFactory({emitter})
  })

  it('properly triggers on events', () => {
    const callListener = jest.fn()

    class TestClass {
      @SubscribeTo('some.event')
      numberMethod(...args: any[]) {
        callListener(...args)
      }
    }

    emitter.emit('some.event', 20)

    expect(callListener).toBeCalledTimes(1)
    expect(callListener).toBeCalledWith(20)
  })

  it('waits for all listeners to finish before proceeding', () => {
    const callListener = jest.fn()

    class TestClass {
      @SubscribeTo('some.event')
      numberMethod(...args: any[]) {
        syncWait(50)
        callListener(...args)
      }
    }

    emitter.emit('some.event', 20)

    expect(callListener).toBeCalled()
  })

  it('waits for async listeners to finish before proceeding', async () => {
    const callListener = jest.fn()

    class TestClass {
      @SubscribeTo('some.event')
      async numberMethod(...args: any[]) {
        await asyncWait(50)
        callListener(...args)
      }
    }

    await emitter.emitAsync('some.event', 20)

    expect(callListener).toBeCalled()
  })

  describe('decorator async: true option', () => {
    it('allows asynchronous processing for synchronous methods', async () => {
      const callListener = jest.fn()

      class TestClass {
        @SubscribeTo('some.event', {async: true})
        numberMethod(...args: any[]) {
          // we synchronously wait a while before calling the cb
          callListener(...args)
        }
      }

      emitter.emit('some.event', 20)

      // not being called until the next "interrupt"
      expect(callListener).not.toBeCalled()

      // break the synchronous execution to allow the event listener to execute
      await asyncWait(0)

      expect(callListener).toBeCalled()
    })

    it('allows asynchronous processing for asynchronous methods', async () => {
      const callListener = jest.fn()

      class TestClass {
        @SubscribeTo('some.event', {async: true})
        async numberMethod(...args: any[]) {
          callListener(...args)
        }
      }

      emitter.emit('some.event', 20)

      // not being called until the next "interrupt"
      expect(callListener).not.toBeCalled()

      // break the synchronous execution to allow the event listener to execute
      await asyncWait(0)

      expect(callListener).toBeCalled()
    })
  })
})
