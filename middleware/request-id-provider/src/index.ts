import type {NextHandleFunction, IncomingMessage as BaseIncomingMessage} from 'connect'
import {v4 as uuid, validate} from 'uuid'

declare module 'http' {
  interface IncomingMessage {
    requestId: string
  }
}

export const DEFAULT_REQUEST_ID_HEADER = 'x-request-id'

const getRequestIdFromReq = (
  req: BaseIncomingMessage,
  headerName: string,
  filter: ((requestId: string) => string | undefined) | undefined
): string | undefined => {
  const rawHeader = req.headers[headerName.toLowerCase()]
  if (typeof rawHeader === 'undefined' || typeof rawHeader === 'string') {
    return filter && rawHeader ? filter(rawHeader) : rawHeader
  }
  return filter && rawHeader[0] ? filter(rawHeader[0]) : rawHeader[0]
}

export type RequestIdProviderOptions = {
  requestIdHeaderName?: string

  readFromRequest?: boolean

  addToReqHeaders?: boolean

  addToResHeaders?: boolean

  /**
   * If set the requestId is not only attached to the request but also provided to this callback
   */
  contextSetter?: (requestId: string) => void

  /**
   * provide a custom request id generator instead of using built-in uuid v4
   */
  requestIdGenerator?: () => string

  requestIdFilter?: (requestId: string) => string | undefined
}

const defaultOptions = {
  requestIdHeaderName: DEFAULT_REQUEST_ID_HEADER,
  readFromRequest: false,
  addToReqHeaders: true,
  addToResHeaders: true,
  requestIdGenerator: uuid,
  requestIdFilter: (requestId: string): string | undefined =>
    validate(requestId) ? requestId : undefined,
} satisfies RequestIdProviderOptions

/**
 * Request Id Middleware Factory
 * The returned middleware can be used to handle and unify a request id (sometimes referred to correlation id) behavior.
 * These ids can be used to group multiple log entries, api calls and operations together with one
 * identifier which helps to group them together.
 * One example use-case is to understand which incoming request triggered another api call which might result in an error.
 * If no request id is found in the header a new uuid is created and used for subsequential operations
 */
const requestIdProviderMiddlewareFactory = (
  userOptions?: RequestIdProviderOptions
): NextHandleFunction => {
  const {
    contextSetter,
    addToReqHeaders,
    addToResHeaders,
    readFromRequest,
    requestIdGenerator,
    requestIdHeaderName,
    requestIdFilter,
  } = {...defaultOptions, ...userOptions}

  return (req, res, next) => {
    const requestId: string =
      (readFromRequest && getRequestIdFromReq(req, requestIdHeaderName, requestIdFilter)) ||
      requestIdGenerator()

    if (contextSetter) contextSetter(requestId)

    if (addToReqHeaders) req.headers[requestIdHeaderName.toLowerCase()] = requestId
    if (addToResHeaders) res.setHeader(requestIdHeaderName, requestId)

    req.requestId = requestId

    next()
  }
}

export default requestIdProviderMiddlewareFactory
