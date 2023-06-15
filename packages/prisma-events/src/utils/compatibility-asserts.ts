export const printCompatibilityErrorMessage = (action: string): void => {
  // eslint-disable-next-line no-console
  console.error(`The used prisma client version is not compatible with this library: ${action}`)
  // eslint-disable-next-line no-console
  console.trace()
}

export const isValidTransactionInfo = (info: unknown): info is {id: string} =>
  typeof info === 'object' && info !== null && 'id' in info && typeof info.id === 'string'

export const isValidEngine = (
  engine: unknown
): engine is {transaction: (...args: unknown[]) => unknown} =>
  typeof engine === 'object' &&
  engine !== null &&
  'transaction' in engine &&
  typeof engine.transaction === 'function'

export const isValidTransactionFunction = (
  func: unknown
): func is (...args: unknown[]) => unknown => typeof func === 'function'

export const isPromiseLike = (res: unknown): res is Pick<Promise<unknown>, 'then'> =>
  typeof res === 'object' && res !== null && 'then' in res && typeof res.then === 'function'
