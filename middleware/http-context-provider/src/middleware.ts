import type {NextHandleFunction} from 'connect'

import {createContextStorage} from './context'

// Initializes context for every inbound request
const httpContextMiddleware: NextHandleFunction = (req, res, next) => {
  createContextStorage(next)
}

export default httpContextMiddleware
