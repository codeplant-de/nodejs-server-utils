import {PrismaClient} from '@prisma/client'
import TransactionalFactory from './transactional'
import clientProxy, {ExtendedClient} from '../proxies/client'
import {testClient} from '../__tests__/test-client'

describe('decorators > Transactional', () => {
  let client: ExtendedClient<PrismaClient>
  const clientDelegate = () => client

  const Transactional = TransactionalFactory({clientDelegate})

  beforeEach(() => {
    client = clientProxy(testClient, {logger: {silly: console.log, warn: console.log}})
  })

  describe('basic guarantees', () => {
    it('does not alter the return value of a method', async () => {
      class TestClass {
        @Transactional()
        someMethod() {
          return Promise.resolve(1)
        }
      }

      const instance = new TestClass()

      expect(await instance.someMethod()).toBe(1)
    })

    it('does not alter the parameters of a method', async () => {
      class TestClass {
        @Transactional()
        someMethod(arg1: object) {
          return Promise.resolve(arg1)
        }
      }

      const instance = new TestClass()

      const someArg = {}
      expect(await instance.someMethod(someArg)).toBe(someArg)
    })
  })

  describe('transaction handling', () => {
    it('opens a new transaction', async () => {
      class TestClass {
        @Transactional()
        async someMethod() {
          return client.$inTransaction
        }
      }

      const instance = new TestClass()

      expect(await instance.someMethod()).toBe(true)
    })

    it('passes down the transaction through method calls', async () => {
      class TestClass {
        @Transactional()
        async someMethod() {
          return this.someOtherMethod()
        }

        private async someOtherMethod() {
          return client.$inTransaction
        }
      }

      const instance = new TestClass()

      expect(await instance.someMethod()).toBe(true)
    })

    it('handles nested @Transactional decorators properly', async () => {
      class TestClass {
        @Transactional()
        async someMethod() {
          return this.someOtherMethod()
        }

        @Transactional()
        private async someOtherMethod() {
          return client.$inTransaction
        }
      }

      const instance = new TestClass()

      expect(await instance.someMethod()).toBe(true)
    })
  })
})
