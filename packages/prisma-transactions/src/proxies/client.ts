import type {Prisma} from '@prisma/client'
import {exitTransactionContext, getCurrentTransactionFromCtx} from '../context'
import {CompatibleLogger} from '../types/misc'
import transactionProxy from './transaction'

const shouldInterceptMethod = (property: string | symbol): boolean =>
  property === '$transaction' ||
  property === '$inTransaction' ||
  property === '$currentTransaction' ||
  property === '$leaveTransaction' ||
  (typeof property === 'string' && !property.startsWith('$') && !property.startsWith('_'))

export type ClientProxyOptions = {
  logger?: CompatibleLogger
  /**
   * default false: we are not created nested transactions but are reusing any context transaction if available
   */
  allowNestedTransactions?: boolean
}

export type ExtendedClient<C extends object> = C & {
  $inTransaction: boolean
  $currentTransaction: Prisma.TransactionClient | undefined
  $leaveTransaction: C
}

const clientProxy = <C extends object>(
  client: C,
  {allowNestedTransactions, logger}: ClientProxyOptions = {}
): ExtendedClient<C> =>
  new Proxy(client, {
    get(target: C, p: string | symbol, receiver: any): any {
      // hot path early return
      if (!shouldInterceptMethod(p)) {
        return Reflect.get(target, p, receiver)
      }

      const txFromContext = getCurrentTransactionFromCtx()

      switch (p) {
        case '$transaction': {
          const transactionFunction = Reflect.get(client, p, receiver)
          // @todo assert is function
          return transactionProxy(transactionFunction as any, {
            logger,
            parentTx: !allowNestedTransactions ? txFromContext : undefined,
          })
        }
        case '$inTransaction':
          return typeof txFromContext !== 'undefined'
        case '$currentTransaction':
          return txFromContext
        case '$leaveTransaction':
          return exitTransactionContext(() => target)
        default:
          if (!txFromContext) {
            return Reflect.get(target, p, receiver)
          }

          return exitTransactionContext(() => {
            logger?.silly('forwarding invocation to transaction from context')
            return Reflect.get(txFromContext, p, receiver)
          })
      }
    },
  }) as ExtendedClient<C>

export default clientProxy
