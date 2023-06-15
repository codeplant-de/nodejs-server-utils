import type {Prisma} from '@prisma/client'
import type {Operation} from '@prisma/client/runtime/library'

export * from './options'
export * from './utils'
export * from './allow-or-block'

export type DatabaseEventName = `${Prisma.ModelName}.${Exclude<
  Operation,
  | 'aggregate'
  | 'count'
  | 'groupBy'
  | '$queryRaw'
  | '$executeRaw'
  | '$queryRawUnsafe'
  | '$executeRawUnsafe'
  | '$runCommandRaw'
>}`
