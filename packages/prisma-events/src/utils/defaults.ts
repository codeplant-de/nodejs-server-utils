import {InternalPrismaEventsOptions} from '../types'

/**
 * @todo fix type to actually remove keys having undefined values
 * @param object
 */
export const filterUndefined = <O extends {}>(object: O): O =>
  (Object.entries(object) as [keyof O, O[keyof O]][]).reduce<O>((res, [key, value]) => {
    if (typeof value !== 'undefined') {
      res[key] = value
    }
    return res
  }, {} as O)

export const defaultOperationEventNameFactory = (
  model: string | undefined,
  operation: string
): string => (model ? `db.prisma.${model}.${operation}` : `db.prisma.${operation}`)

export const defaultTransactionEventNameFactory = (action: string, txId: string): string =>
  `db.prisma.transaction.${action}.${txId}`

const defaultOptions = {
  operationEventNameFactory: defaultOperationEventNameFactory,
  transactionEventNameFactory: defaultTransactionEventNameFactory,
} satisfies Partial<InternalPrismaEventsOptions>

export const assignDefaultOptions = <O extends {}>(options: O): O & typeof defaultOptions =>
  ({
    ...defaultOptions,
    ...filterUndefined(options),
  } as unknown as O & typeof defaultOptions)
