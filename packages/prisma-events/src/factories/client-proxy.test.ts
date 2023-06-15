import {PrismaClient} from '@prisma/client'
import {prisma} from '../__tests__/test-client'
import clientProxyFactory from './client-proxy'

describe('factories > client-proxy', () => {
  const emitter = {emit: jest.fn()}
  let client: PrismaClient

  beforeEach(() => {
    emitter.emit.mockClear()

    const clientWrapper = clientProxyFactory({
      transactionEventNameFactory: (action, txId) => `${action}.${txId}`,
      emitter,
    })

    client = clientWrapper(prisma)
  })

  it('emits transaction events in success case', async () => {
    await client.$transaction(async tx => {
      await tx.user.findMany()
    })

    expect(emitter.emit.mock.calls).toEqual([
      [expect.stringMatching(/^start\.[\w\d]+$/)],
      [expect.stringMatching(/^commit\.[\w\d]+$/)],
    ])
  })

  it('emits transaction events in rollback case', async () => {
    try {
      await client.$transaction(async tx => {
        await tx.user.findMany()

        // eslint-disable-next-line no-throw-literal
        throw 'some error'
      })
    } catch (e: any) {
      if (e !== 'some error') {
        throw e
      }
    }

    expect(emitter.emit.mock.calls).toEqual([
      [expect.stringMatching(/^start\.[\w\d]+$/)],
      [expect.stringMatching(/^rollback\.[\w\d]+$/)],
    ])
  })
})
