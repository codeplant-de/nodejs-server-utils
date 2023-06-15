import type {PrismaClient} from '@prisma/client'

export type TransactionalFactoryOptions = {
  clientDelegate: () => PrismaClient
}

export type InferOptions<T extends (...args: any) => any> = T extends (
  arg1: any,
  args2: infer P,
  ...args: any[]
) => any
  ? P
  : never

export type TransactionalOptions = InferOptions<PrismaClient['$transaction']>

export type TransactionalDecorator = (options: TransactionalOptions) => MethodDecorator

export type CustomMethodDecorator<T> = (
  target: Object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void
