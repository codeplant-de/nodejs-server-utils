import {
  isPromiseLike,
  isValidTransactionInfo,
  printCompatibilityErrorMessage,
} from '../utils/compatibility-asserts'

export type Emitter = (action: string, txId: string) => void

const transactionFunctionProxy = <F extends (...args: any[]) => any>(
  emit: Emitter,
  transactionFunction: F
): F =>
  new Proxy(transactionFunction, {
    apply(target: F, thisArg: any, argArray: any[]): any {
      const [action, , info] = argArray

      const resultPromise = Reflect.apply(target, thisArg, argArray)

      if (!isPromiseLike(resultPromise)) {
        printCompatibilityErrorMessage(
          "engine.transaction function is expected to return a promise which it didn't"
        )
        return resultPromise
      }

      switch (action) {
        case 'start':
          // transaction getting started, we get the txId from result promise
          return resultPromise.then(result => {
            if (!isValidTransactionInfo(result)) {
              printCompatibilityErrorMessage(
                `engine.transaction(start, ...) is expected to return an info object containing the transaction id but it returned: ${JSON.stringify(
                  result
                )}`
              )
              return result
            }

            emit(action, result.id)
            return result
          })
        case 'commit':
        case 'rollback':
          if (!isValidTransactionInfo(info)) {
            printCompatibilityErrorMessage(
              `engine.transaction(${action}, ...) is should receive an info object as third argument containing the transaction id but it received: ${JSON.stringify(
                info
              )}`
            )

            return resultPromise
          }

          return resultPromise.then(result => {
            emit(action, info.id)
            return result
          })
        default:
          return resultPromise
      }
    },
  })

export default transactionFunctionProxy
