import type {NextFunction} from 'connect'
import {performance} from 'perf_hooks'
import {IncomingMessage, ServerResponse} from 'node:http'
import onHeaders from 'on-headers'
import onFinished from 'on-finished'
import {Options} from './types/options'

import {defaultRequestToMeta, defaultResponseToMeta} from './defaults'
import {formatTimestamp, mergeFormatters} from './utils'

export type RequestLoggingOptions = Partial<Options> & Pick<Options, 'loggerAccessor'>

const requestLoggingMiddlewareFactory = <
  REQ extends IncomingMessage = IncomingMessage,
  RES extends ServerResponse = ServerResponse
>(
  userOptions: RequestLoggingOptions
): ((req: REQ, res: RES, next: NextFunction) => void) => {
  const options = {
    hook: 'on-headers',
    level: 'info',
    metaField: 'meta',
    reqField: 'req',
    resField: 'res',
    requestToMeta: defaultRequestToMeta,
    responseToMeta: defaultResponseToMeta,
    skip: () => false,
    messageTemplate: (req: REQ): string => `HTTP ${req.method} ${req.url}`,
    timestampAccessor: () => performance.now(),
    baseMeta: {},
    ...userOptions,
  } satisfies Options<REQ, RES>

  const requestToMeta =
    typeof options.requestToMeta === 'function'
      ? options.requestToMeta
      : mergeFormatters(options.requestToMeta)
  const responseToMeta =
    typeof options.responseToMeta === 'function'
      ? options.responseToMeta
      : mergeFormatters(options.responseToMeta)

  return (req, res, next) => {
    const startTime = options.timestampAccessor()
    const emitter = options.hook === 'on-headers' ? onHeaders : onFinished

    emitter(res, () => {
      if (options.skip(req, res)) {
        return
      }

      const meta: Record<string, any> = {
        duration: formatTimestamp(options.timestampAccessor() - startTime),
      }

      if (options.reqField) {
        meta[options.reqField] = requestToMeta(req as any)
      }
      if (options.resField) {
        meta[options.resField] = responseToMeta(res as any)
      }

      const infoObj: Record<string, any> = {}
      if (options.metaField) {
        infoObj[options.metaField] = meta
      } else {
        Object.assign(infoObj, meta)
      }

      const logger = options.loggerAccessor(req)
      const logLevel = typeof options.level === 'function' ? options.level(req, res) : options.level
      logger.log({
        level: logLevel,
        message: options.messageTemplate(req, res),
        ...infoObj,
      })
    })

    next()
  }
}

export default requestLoggingMiddlewareFactory
