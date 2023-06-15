import type {PrismaClient} from '@prisma/client'
import {faker} from '@faker-js/faker'
import clientProxy, {ExtendedClient} from './client'
import {testClient} from '../__tests__/test-client'

describe('proxies > client', () => {
  let client: ExtendedClient<PrismaClient>

  beforeEach(() => {
    client = clientProxy(testClient)
  })

  it('allow normal usage of the client', async () => {
    const user = await client.user.create({
      data: {
        name: faker.person.fullName(),
      },
    })

    const dbUser = await client.user.findUnique({where: {id: user.id}})

    expect(dbUser).not.toBeNull()
  })

  describe('client.$inTransaction', () => {
    it('correctly detects when outside of a transaction', () => {
      expect(client.$inTransaction).toBeFalsy()
    })

    it('correctly detects when inside of a transaction', async () => {
      await client.$transaction(async tx => {
        expect(tx.$inTransaction).toBeTruthy()
        expect(client.$inTransaction).toBeTruthy()
      })
    })
  })

  describe('client.$currentTransaction', () => {
    it('returns undefined when outside of a transaction', () => {
      expect(client.$currentTransaction).toBeUndefined()
    })

    it('returns the current transaction when inside of a transaction', async () => {
      await client.$transaction(async tx => {
        expect(client.$currentTransaction === tx).toBeTruthy()
      })
    })
  })

  describe('delegation to open transaction', () => {
    it('properly isolates in transactions', async () => {
      let createdUserId: string | undefined

      const createUser = (name: string) => client.user.create({data: {name}}).then(user => user.id)
      const getUserById = (id: string) => client.user.findUnique({where: {id}})

      try {
        await client.$transaction(async () => {
          createdUserId = await createUser(faker.person.fullName())

          expect(await getUserById(createdUserId)).toBeTruthy()

          throw new Error('rollback')
        })
      } catch (e: any) {
        if (e.message !== 'rollback') {
          throw e
        }
      }

      expect(await getUserById(createdUserId!)).toBeNull()
    })
  })

  describe('client.$skipTransaction', () => {
    it('allows to escape the current transaction', async () => {
      let createdUserId: string | undefined

      const createUser = (name: string) => client.user.create({data: {name}}).then(user => user.id)
      const getUserById = (id: string) => client.user.findUnique({where: {id}})

      try {
        await client.$transaction(async () => {
          createdUserId = await createUser(faker.person.fullName())

          expect(await getUserById(createdUserId)).toBeTruthy()

          expect(
            await client.$leaveTransaction.user.findUnique({where: {id: createdUserId}})
          ).toBeNull()

          throw new Error('rollback')
        })
      } catch (e: any) {
        if (e.message !== 'rollback') {
          throw e
        }
      }
    })
  })
})
