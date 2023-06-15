/* eslint-disable @typescript-eslint/no-unused-vars */
import SubscribeToFactory from './subscribe-to'

declare module '../types' {
  interface ApplicationEvents {
    'some.event': [number]
  }
}

describe('decorators > SubscribeTo', () => {
  const globalEmitter = {
    on: jest.fn(),
  }

  const SubscribeTo = SubscribeToFactory({emitter: globalEmitter})

  beforeEach(() => {
    globalEmitter.on.mockClear()
  })

  it('supports basic type checks', () => {
    class TestClass {
      @SubscribeTo('some.event')
      numberMethod(someNumber: number) {}

      // @ts-expect-error event emits with number argument
      @SubscribeTo('some.event')
      stringMethod(someString: string) {}

      @SubscribeTo('unknown.event')
      unknownEventListener() {}

      // @ts-expect-error unknown events have unknown event params
      @SubscribeTo('unknown.event')
      unknownEventListenerWithArgs(someNumber: number) {}
    }
  })

  describe('subscription', () => {
    it('subscribes to global emitter', () => {
      class TestClass {
        @SubscribeTo('some.event')
        numberMethod(someNumber: number) {}
      }

      expect(globalEmitter.on).toBeCalledTimes(1)
    })

    it('subscribes to a provided emitter', () => {
      const emitter = {
        on: jest.fn(),
      }

      class TestClass {
        @SubscribeTo('some.event', {emitter})
        numberMethod(someNumber: number) {}
      }

      expect(emitter.on).toBeCalledTimes(1)
    })
  })
})
