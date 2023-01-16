import type {NextHandleFunction} from 'connect'
import {AsyncLocalStorage} from 'node:async_hooks'

export type Store = Map<string | symbol, any>

const asyncLocalStorage = new AsyncLocalStorage<Store>()

export const getClsNamespace = (): AsyncLocalStorage<Store> => asyncLocalStorage

// Initializes context for every inbound request
const httpContextMiddleware: NextHandleFunction = (req, res, next) => {
  asyncLocalStorage.run(new Map(), () => next())
}

export default httpContextMiddleware
