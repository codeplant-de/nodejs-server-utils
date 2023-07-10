import type {NextFunction} from 'connect'
import onHeaders from 'on-headers'
import onFinished from 'on-finished'
import {Options} from './types/options'

import {formatTimestamp, mergeFormatters} from './utils'
import {CompatibleRequest, CompatibleResponse} from './types/compatible'
import {
  defaultLevelFunction,
  defaultMessageTemplate,
  defaultRequestToMetaFormatter,
  defaultResponseToMetaFormatter,
  defaultSkipFunction,
  defaultTimestampAccessor,
} from './defaults'

export type RequestLoggingOptions<
  REQ extends CompatibleRequest | unknown,
  RES extends CompatibleResponse | unknown
> = Partial<Options<REQ, RES>> & Pick<Options<REQ, RES>, 'loggerAccessor'>

const requestLoggingMiddlewareFactory = <
  REQ extends CompatibleRequest,
  RES extends CompatibleResponse
>(
  userOptions: RequestLoggingOptions<REQ, RES>
): ((req: REQ, res: RES, next: NextFunction) => void) => {
  const options = {
    hook: 'on-headers',
    level: defaultLevelFunction,
    metaField: 'meta',
    reqField: 'req',
    resField: 'res',
    requestToMeta: defaultRequestToMetaFormatter,
    responseToMeta: defaultResponseToMetaFormatter,
    skip: defaultSkipFunction,
    messageTemplate: defaultMessageTemplate,
    timestampAccessor: defaultTimestampAccessor,
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
