import {URL} from 'node:url'
import {filterSensitiveVariablesHelper, getIpFromExpressRequest, hasOriginalUrl} from '../utils'
import {CompatibleRequest} from '../types/compatible'
import {DEFAULT_SENSITIVE_VARIABLE_LIST, UNKNOWN_INDICATOR} from '../constants'

export type RequestToMetaFormatter<T extends CompatibleRequest | unknown> = (
  req: T
) => Record<string, unknown> | undefined

export const defaultRequestToMetaFormatter: RequestToMetaFormatter<CompatibleRequest> = req => {
  const headers = filterSensitiveVariablesHelper(req.headers, DEFAULT_SENSITIVE_VARIABLE_LIST)
  const clientIp = getIpFromExpressRequest(req)

  // if originalUrl is present we assume the url to be already parsed (e.g. by express)
  if (hasOriginalUrl(req)) {
    return {
      url: req.originalUrl ?? UNKNOWN_INDICATOR,
      headers,
      method: req.method,
      httpVersion: req.httpVersion ?? UNKNOWN_INDICATOR,
      query: {...req.query},
      clientIp,
    }
  }
  const url = new URL(req.url ?? '', `http://${req.headers.host ?? 'unknown'}`)
  return {
    url: req.url,
    headers,
    method: req.method,
    httpVersion: req.httpVersion ?? UNKNOWN_INDICATOR,
    query: Object.fromEntries(url.searchParams),
    clientIp,
  }
}
