import type {Prisma} from '@prisma/client'
import {shouldTriggerEventFactory} from '../utils'
import {InternalPrismaEventsOptions} from '../types'
import DatabaseEvent from '../DatabaseEvent'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/explicit-module-boundary-types
const extensionFactory = (options: InternalPrismaEventsOptions) => {
  const {
    allowList,
    blockList,
    emitter,
    operationEventNameFactory,
    transactionEventNameFactory,
    logger,
    includeResult,
    rethrowEmitErrors,
  } = options

  const shouldTriggerEvent = shouldTriggerEventFactory(allowList ?? [], blockList ?? [])

  // noinspection UnnecessaryLocalVariableJS
  const extension = {
    name: '@codeplant-de/prisma-events',
    query: {
      $allModels: {
        $allOperations: ({query, operation, model, args, ...additionalArguments}): Promise<any> => {
          // @ts-expect-error using internal api to collect transaction details
          const {__internalParams} = additionalArguments

          if (shouldTriggerEvent(model, operation)) {
            return query(args).then(result => {
              const eventNameToEmit = operationEventNameFactory(model, operation)

              try {
                const txId = __internalParams?.transaction?.id ?? 'unknown'

                const event = new DatabaseEvent({
                  dataPath: __internalParams.dataPath,
                  transaction: __internalParams.transaction,
                  result: includeResult ? result : undefined,
                  transactionCallbacks: {
                    commit: (cb: () => void): void => {
                      const txEventNameToEmit = transactionEventNameFactory('commit', txId)
                      logger?.silly(`Adding transaction callback for: ${txEventNameToEmit}`)
                      return emitter.once(txEventNameToEmit, cb)
                    },

                    rollback: (cb: () => void): void => {
                      const txEventNameToEmit = transactionEventNameFactory('rollback', txId)
                      logger?.silly(`Adding transaction callback for: ${txEventNameToEmit}`)
                      return emitter.once(txEventNameToEmit, cb)
                    },
                  },
                  args,
                })

                logger?.silly(`Emitting event: ${eventNameToEmit}`)
                emitter.emit(eventNameToEmit, event)
              } catch (e: unknown) {
                if (e instanceof Error) {
                  logger?.error(`Error while emitting event ${eventNameToEmit}: ${e.message}`)
                } else {
                  logger?.error(`Unknown error while emitting event ${eventNameToEmit}`)
                }
                if (rethrowEmitErrors) {
                  throw e
                }
              }
              return result
            })
          }
          return query(args)
        },
      },
    },
  } satisfies Partial<Prisma.Extension>

  return extension
}

export default extensionFactory
