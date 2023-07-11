import type {NextFunction} from 'connect'
import onHeaders from 'on-headers'
import onFinished from 'on-finished'
import {Options} from './types/options'

import {assignMeta, formatTimestamp, mergeFormatters} from './utils'
import {CompatibleRequest, CompatibleResponse} from './types/compatible'
import {
  defaultContextToMetaFormatter,
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
  userConfig: RequestLoggingOptions<REQ, RES>
): ((req: REQ, res: RES, next: NextFunction) => void) => {
  const config = {
    hook: 'on-headers',
    level: defaultLevelFunction,
    metaField: 'meta',
    reqField: 'req',
    resField: 'res',
    ctxField: 'ctx',
    requestToMeta: defaultRequestToMetaFormatter,
    responseToMeta: defaultResponseToMetaFormatter,
    contextToMeta: defaultContextToMetaFormatter,
    skip: defaultSkipFunction,
    messageTemplate: defaultMessageTemplate,
    timestampAccessor: defaultTimestampAccessor,
    baseMeta: {},
    ...userConfig,
  } satisfies Options<REQ, RES>

  const requestToMeta =
    typeof config.requestToMeta === 'function'
      ? config.requestToMeta
      : mergeFormatters(config.requestToMeta)
  const responseToMeta =
    typeof config.responseToMeta === 'function'
      ? config.responseToMeta
      : mergeFormatters(config.responseToMeta)
  const contextToMeta =
    typeof config.contextToMeta === 'function'
      ? config.contextToMeta
      : mergeFormatters(config.contextToMeta)

  return (req, res, next) => {
    const startTime = config.timestampAccessor()
    const emitter = config.hook === 'on-headers' ? onHeaders : onFinished

    const meta: Record<string, unknown> = {...config.baseMeta}

    emitter(res, () => {
      if (config.skip(req, res)) {
        return
      }

      meta.duration = formatTimestamp(config.timestampAccessor() - startTime)

      if (requestToMeta) {
        const reqMeta = requestToMeta(req as REQ)
        if (reqMeta) {
          assignMeta(meta, reqMeta, config.reqField)
        }
      }

      if (responseToMeta) {
        const resMeta = responseToMeta(res as RES)
        if (resMeta) {
          assignMeta(meta, resMeta, config.resField)
        }
      }

      if (contextToMeta) {
        const ctxMeta = contextToMeta(req, res)
        if (ctxMeta) {
          assignMeta(meta, ctxMeta, config.ctxField)
        }
      }

      const infoObj: Record<string, unknown> = {}
      assignMeta(infoObj, meta, config.metaField)

      const logger = config.loggerAccessor(req)
      const logLevel = typeof config.level === 'function' ? config.level(req, res) : config.level
      logger.log({
        level: logLevel,
        message: config.messageTemplate(req, res),
        ...infoObj,
      })
    })

    next()
  }
}

export default requestLoggingMiddlewareFactory
