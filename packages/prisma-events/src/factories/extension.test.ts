import {prisma} from '../__tests__/test-client'
import extensionFactory from './extension'
import DatabaseEvent from '../DatabaseEvent'
import {assignDefaultOptions} from '../utils'

describe('extension', () => {
  const emitter = {emit: jest.fn(), once: jest.fn(), on: jest.fn()}

  beforeEach(() => {
    emitter.emit.mockClear()
    emitter.once.mockClear()
    emitter.on.mockClear()
  })

  it('properly emits events for simple queries', async () => {
    const xprisma = prisma.$extends(extensionFactory(assignDefaultOptions({emitter})))

    await xprisma.user.findMany()

    expect(emitter.emit).toBeCalledWith('db.prisma.User.findMany', expect.any(DatabaseEvent))
  })

  it('works within transactions', async () => {
    const xprisma = prisma.$extends(extensionFactory(assignDefaultOptions({emitter})))

    await xprisma.$transaction(async tx => {
      await tx.user.findMany()
    })

    expect(emitter.emit).toBeCalledTimes(1)
    expect(emitter.emit).toBeCalledWith('db.prisma.User.findMany', expect.any(DatabaseEvent))
  })
})
