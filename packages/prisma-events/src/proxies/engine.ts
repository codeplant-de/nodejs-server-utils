import transactionFunctionProxy, {Emitter} from './transactionFunction'
import {
  isValidTransactionFunction,
  printCompatibilityErrorMessage,
} from '../utils/compatibility-asserts'

const engineProxy = <E extends object>(emit: Emitter, baseEngine: E): E =>
  new Proxy(baseEngine, {
    get(target: object, p: string | symbol, receiver: any): any {
      if (p === 'transaction') {
        // intercept calls to transaction function
        const transactionFn = Reflect.get(target, p, receiver)

        if (isValidTransactionFunction(transactionFn)) {
          return transactionFunctionProxy(emit, transactionFn)
        }
        printCompatibilityErrorMessage('returned transaction function seems incompatible')
      }

      return Reflect.get(target, p, receiver)
    },
  }) as E

export default engineProxy
