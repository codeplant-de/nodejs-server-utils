import {getContextStorage} from './context'
import {HttpContext} from './types/context'

export function getFromHttpContext<K extends keyof HttpContext>(key: K): HttpContext[K] | null

export function getFromHttpContext<V = unknown>(key: string | symbol): V | null

/**
 * Gets a value from the context by key.
 * Returns null if the context has not yet been initialized for this request or if a value is not found for the specified key.
 * @param {string} key
 * @return null | any
 */
export function getFromHttpContext<V = unknown>(key: string | symbol): V | null {
  const store = getContextStorage()
  if (store?.has(key)) {
    return store.get(key)
  }
  return null
}

/**
 * Adds a value to the context by key.  If the key already exists, its value will be overwritten.  No value will persist if the context has not yet been initialized.
 * @param {string|symbol} key
 * @param {*} value
 */
export const storeInHttpContext = <V = unknown>(key: string | symbol, value: V): V | null => {
  const store = getContextStorage()
  if (store) {
    store.set(key, value)
    return value
  }
  return null
}
