import type {IncomingMessage} from 'node:http'
import {URL} from 'node:url'
import {ServerResponse} from 'node:http'

export const FILTERED_INDICATOR = '[FILTERED]'

export const UNKNOWN_INDICATOR = '[UNKNOWN]'

export const defaultRequestToMeta = (
  req: IncomingMessage & Record<string, unknown>
): Record<string, unknown> => {
  const headers = {...req.headers}
  if (headers.authorization) {
    headers.authorization = FILTERED_INDICATOR
  }

  // if originalUrl is present we assume the url to be already parsed (e.g. by express)
  if (req.originalUrl) {
    return {
      url: req.url ?? UNKNOWN_INDICATOR,
      headers,
      method: req.method,
      httpVersion: req.httpVersion ?? UNKNOWN_INDICATOR,
      originalUrl: req.originalUrl ?? UNKNOWN_INDICATOR,
      // @ts-expect-error to be fixed
      query: {...req.query},
    }
  }
  const url = new URL(req.url ?? '', `http://${req.headers.host ?? 'unknown'}`)
  return {
    url: req.url,
    headers,
    method: req.method,
    httpVersion: req.httpVersion ?? UNKNOWN_INDICATOR,
    originalUrl: req.url,
    query: Object.fromEntries(url.searchParams),
  }
}

export const defaultResponseToMeta = (res: ServerResponse): Record<string, unknown> => ({
  statusCode: res.statusCode,
})
