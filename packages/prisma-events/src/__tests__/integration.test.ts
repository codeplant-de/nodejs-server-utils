/* eslint-disable @typescript-eslint/no-unused-vars */
import EventEmitter2 from 'eventemitter2'
import {faker} from '@faker-js/faker'
import {PrismaClient} from '@prisma/client'
import create from '../create'
import {prisma} from './test-client'
import DatabaseEvent from '../DatabaseEvent'
import {SubscribeToDatabaseEventDecorator} from '../decorators'

describe('integration', () => {
  let ee: EventEmitter2
  let extendedClient: PrismaClient
  let SubscribeToDatabaseEvent: SubscribeToDatabaseEventDecorator

  beforeEach(() => {
    ee = new EventEmitter2()

    const {applyToClient, SubscribeToDatabaseEvent: decorator} = create({emitter: ee})

    extendedClient = applyToClient(prisma)
    SubscribeToDatabaseEvent = decorator
  })

  it('triggers the correct raw events', async () => {
    const commitCb = jest.fn()
    const createCb = jest.fn((event: DatabaseEvent) => {
      event.onTransactionCommit(() => {
        commitCb()
      })
    })

    ee.on('db.prisma.User.create', createCb)

    await extendedClient.$transaction(async tx => {
      await tx.user.create({data: {name: faker.person.fullName()}})
    })

    expect(createCb).toBeCalledWith(expect.any(DatabaseEvent))
    expect(commitCb).toBeCalledTimes(1)
  })

  describe('with subscribe decorator', () => {
    it('full cycle using transactions', async () => {
      const listenerCb = jest.fn()

      class TestClass {
        property = 'asd'

        @SubscribeToDatabaseEvent('User.create')
        listener(ev: DatabaseEvent) {
          // do we have a proper "this" context?
          expect(this).toBeInstanceOf(TestClass)
          expect(this.property).toBe('asd')

          listenerCb(ev)
        }
      }

      const userName = faker.person.fullName()
      await extendedClient.$transaction(async tx => {
        await tx.user.create({data: {name: userName}})

        // by default, we wait for the transaction to finish
        expect(listenerCb).not.toBeCalled()
      })

      expect(listenerCb).toBeCalledWith(expect.any(DatabaseEvent))

      const databaseEvent = listenerCb.mock.calls[0][0] as DatabaseEvent

      expect(databaseEvent.getArgs()).toStrictEqual({data: {name: userName}})
      expect(databaseEvent.inTransaction()).toBe(false)
    })

    it('does not delay listener execution when passing "waitForTransaction" option', async () => {
      const listenerCb = jest.fn()

      class TestClass {
        @SubscribeToDatabaseEvent('User.create', {waitForTransaction: false})
        listener(ev: DatabaseEvent) {
          listenerCb(ev)
        }
      }

      const userName = faker.person.fullName()
      await extendedClient.$transaction(async tx => {
        await tx.user.create({data: {name: userName}})

        expect(listenerCb).toBeCalled()
      })
    })

    it('works when not using transactions', async () => {
      const listenerCb = jest.fn()

      class TestClass {
        @SubscribeToDatabaseEvent('User.create', {waitForTransaction: false})
        listener(ev: DatabaseEvent) {
          listenerCb(ev)
        }
      }

      const userName = faker.person.fullName()
      await extendedClient.user.create({data: {name: userName}})

      expect(listenerCb).toBeCalledWith(expect.any(DatabaseEvent))

      const databaseEvent = listenerCb.mock.calls[0][0] as DatabaseEvent

      expect(databaseEvent.getArgs()).toStrictEqual({data: {name: userName}})
      expect(databaseEvent.inTransaction()).toBe(false)
    })
  })
})
