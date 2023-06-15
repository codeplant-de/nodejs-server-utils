import {AsyncLocalStorage} from 'node:async_hooks'
import type {Prisma} from '@prisma/client'

export type Store = {tx?: Prisma.TransactionClient}

const ctx = new AsyncLocalStorage<Store>()

export const getCurrentTransactionFromCtx = (): Prisma.TransactionClient | undefined =>
  ctx.getStore()?.tx

export const createContextWithTransaction = <Cb extends () => any>(
  tx: Prisma.TransactionClient,
  callback: Cb
): ReturnType<Cb> => {
  const store: Store = {tx}

  return ctx.run(store, callback)
}

export const exitTransactionContext = <Cb extends () => any>(callback: Cb): ReturnType<Cb> =>
  ctx.exit(callback)
