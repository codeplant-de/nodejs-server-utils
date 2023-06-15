import {Emitter} from './transactionFunction'
import engineProxy from './engine'
import {isValidEngine, printCompatibilityErrorMessage} from '../utils/compatibility-asserts'

const clientProxy = <E extends object>(emit: Emitter, baseClient: E): E =>
  new Proxy(baseClient, {
    get(target: object, p: string | symbol, receiver: any): any {
      if (p === '_engine') {
        // intercept calls to transaction function
        const engine = Reflect.get(target, p, receiver)

        if (isValidEngine(engine)) {
          return engineProxy(emit, engine)
        }
        printCompatibilityErrorMessage('returned engine object seems incompatible')
      }

      return Reflect.get(target, p, receiver)
    },
  }) as E

export default clientProxy
