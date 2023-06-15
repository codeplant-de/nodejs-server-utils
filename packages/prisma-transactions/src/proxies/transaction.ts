import type {Prisma} from '@prisma/client'
import {createContextWithTransaction} from '../context'
import {CompatibleLogger} from '../types/misc'

type TransactionProxyOptions = {
  logger?: CompatibleLogger
  parentTx?: Prisma.TransactionClient
}

function transactionProxy<F extends (...args: any[]) => any>(
  transactionFunction: F,
  {logger, parentTx}: TransactionProxyOptions = {}
): F {
  const TransactionProxyHandler: ProxyHandler<F> = {
    apply(target: F, thisArg: any, argArray: any[]): any {
      const [firstArg, ...restArgs] = argArray

      // starting a new interactive transaction
      if (typeof firstArg === 'function') {
        const wrappedInteractiveTransactionCallback = ($tx: any, ...args: any[]): any => {
          if (parentTx) {
            logger?.warn('reusing parent transaction from ctx, this might be unexpected')
            return firstArg.call(thisArg, parentTx, ...args)
          }

          return createContextWithTransaction($tx, () => {
            logger?.silly('adding transaction to ctx')

            return firstArg.call(thisArg, $tx, ...args)
          })
        }

        logger?.silly('starting interactive transaction')
        return Reflect.apply(target, thisArg, [wrappedInteractiveTransactionCallback, ...restArgs])
      }

      return Reflect.apply(target, thisArg, argArray)
    },
  }
  return new Proxy(transactionFunction, TransactionProxyHandler)
}

export default transactionProxy
