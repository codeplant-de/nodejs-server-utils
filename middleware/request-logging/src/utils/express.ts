import {IncomingMessage} from 'node:http'
import type {Request} from 'express'

export const hasOriginalUrl = (
  req: IncomingMessage | Request | unknown
): req is Pick<Request, 'originalUrl'> => typeof (req as Request).originalUrl !== 'undefined'

export const getIpFromExpressRequest = (req: IncomingMessage | Request | any): string | null => {
  if (req.ip) {
    return req.ip
  }
  if ('header' in req && typeof req.header === 'function') {
    return req.header('x-forwarded-for')?.split(',').shift() ?? req.socket?.remoteAddress ?? null
  }

  return req.socket?.remoteAddress ?? null
}
