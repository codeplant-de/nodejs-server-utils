import {AsyncLocalStorage} from 'node:async_hooks'

export type Store = Map<string | symbol, any>

const asyncLocalStorage = new AsyncLocalStorage<Store>()

export const getContext = (): AsyncLocalStorage<Store> => asyncLocalStorage

export const getContextStorage = (): Store | undefined => asyncLocalStorage.getStore()

export const setInContextStorage = (key: string | symbol, value: any): unknown =>
  getContextStorage()?.set(key, value)

export const getFromContextStorage = (key: string | symbol): any | undefined =>
  getContextStorage()?.get(key)

export const hasInContextStorage = (key: string | symbol): boolean | undefined =>
  getContextStorage()?.has(key)

export const createContextStorage = <R, TArgs extends any[]>(
  callback: (...args: TArgs) => R,
  ...args: TArgs
): any => {
  const store = new Map()

  return asyncLocalStorage.run(store, callback, ...args)
}

export const createChildContextStorage = <R, TArgs extends any[]>(
  callback: (...args: TArgs) => R,
  ...args: TArgs
): any => {
  const store = new Map(asyncLocalStorage.getStore())

  return asyncLocalStorage.run(store, callback, ...args)
}
