import {CustomMethodDecorator, TransactionalFactoryOptions, TransactionalOptions} from './types'

function TransactionalFactory(globalOptions: TransactionalFactoryOptions) {
  return function Transactional<M extends (...args: any[]) => Promise<any>>(
    options?: TransactionalOptions
  ): CustomMethodDecorator<M> {
    return (target: object, propertyKey: string | symbol, descriptor) => {
      const orgMethod = descriptor.value as (...args: any[]) => any

      function transactionWrapper(this: object, ...args: any[]): Promise<any> {
        return globalOptions
          .clientDelegate()
          .$transaction(() => orgMethod.call(this, ...args), options)
      }

      // eslint-disable-next-line no-param-reassign
      descriptor.value = transactionWrapper as any
      //
      // return descriptor
    }
  }
}

export default TransactionalFactory
