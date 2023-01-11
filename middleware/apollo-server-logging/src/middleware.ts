import type {ApolloServerPlugin, GraphQLRequestListener} from 'apollo-server-plugin-base'
import {performance} from 'node:perf_hooks'
import type {
  GraphQLRequest,
  GraphQLResponse,
  BaseContext,
  GraphQLRequestContext,
} from 'apollo-server-types'
import type {GraphQLFormattedError, GraphQLError} from 'graphql'
import {Config} from './types/config'
import {
  defaultContextToMetaFormatter,
  defaultErrorMessageTemplate,
  defaultErrorToMetaFormatter,
  defaultLevelFunction,
  defaultMessageTemplate,
  defaultRequestToMetaFormatter,
  defaultResponseToMetaFormatter,
} from './defaults'
import {formatTimestamp} from './utils'

export type ApolloServerLoggingConfig<
  CTX extends BaseContext = BaseContext,
  REQ extends GraphQLRequest = GraphQLRequest,
  RES extends GraphQLResponse = GraphQLResponse,
  ERR extends GraphQLFormattedError | GraphQLError = GraphQLFormattedError | GraphQLError
> = Partial<Config<CTX, REQ, RES, ERR>> &
  Pick<Required<Config<CTX, REQ, RES, ERR>>, 'loggerAccessor'>

export const defaultConfig = {
  level: defaultLevelFunction,
  requestToMeta: defaultRequestToMetaFormatter,
  responseToMeta: defaultResponseToMetaFormatter,
  contextToMeta: defaultContextToMetaFormatter,
  errorToMeta: defaultErrorToMetaFormatter,
  skip: (): boolean => false,
  baseMeta: {},
  metaField: 'meta',
  reqField: 'req',
  resField: 'res',
  ctxField: 'ctx',
  errField: 'err',
  timestampAccessor: (): number => performance.now(),
  errorMessageTemplate: defaultErrorMessageTemplate,
  messageTemplate: defaultMessageTemplate,
} satisfies Omit<Config, 'loggerAccessor'>

const apolloServerLoggingMiddlewareFactory = <
  CTX extends BaseContext = BaseContext,
  REQ extends GraphQLRequest = GraphQLRequest,
  RES extends GraphQLResponse = GraphQLResponse,
  ERR extends GraphQLFormattedError | GraphQLError = GraphQLFormattedError | GraphQLError
>(
  userConfig: ApolloServerLoggingConfig<CTX, REQ, RES, ERR>
): ApolloServerPlugin<CTX> => {
  const config = {
    ...defaultConfig,
    ...userConfig,
  } satisfies Config<CTX, REQ, RES, ERR>

  // noinspection UnnecessaryLocalVariableJS
  const plugin: ApolloServerPlugin<CTX> = {
    // @ts-ignore - need to check for compatibility (async vs not async)
    requestDidStart: ({request}: GraphQLRequestContext<CTX>): GraphQLRequestListener<CTX> => {
      const startTimestamp = config.timestampAccessor()

      const meta: Record<string, unknown> = {...config.baseMeta}

      if (config.reqField) {
        const reqMeta = config.requestToMeta(request as REQ)
        if (reqMeta) {
          meta[config.reqField] = reqMeta
        }
      }

      return {
        willSendResponse: async ({errors, response, context}): Promise<void> => {
          meta.duration = formatTimestamp(config.timestampAccessor() - startTimestamp)

          if (config.resField) {
            const resMeta = config.responseToMeta(response as RES)
            if (resMeta) {
              meta[config.resField] = resMeta
            }
          }
          if (config.ctxField) {
            const ctxMeta = config.contextToMeta(context)
            if (ctxMeta) {
              meta[config.ctxField] = ctxMeta
            }
          }

          if (config.errField && errors) {
            const errMeta = errors.map(err => config.errorToMeta(err as ERR)).filter(Boolean)
            if (errMeta.length > 0) {
              meta[config.errField] = errMeta
            }
          }

          const infoObj: Record<string, unknown> = {}

          if (config.metaField) {
            infoObj[config.metaField] = meta
          } else {
            Object.assign(infoObj, meta)
          }

          const level =
            typeof config.level === 'string'
              ? config.level
              : config.level(
                  request as REQ,
                  response as RES,
                  context as CTX,
                  errors as ReadonlyArray<ERR> | undefined
                )

          const message = errors
            ? config.errorMessageTemplate(
                request as REQ,
                response as RES,
                context as CTX,
                errors as ReadonlyArray<ERR>
              )
            : config.messageTemplate(request as REQ, response as RES, context as CTX)

          const logger = config.loggerAccessor(request as REQ, context as CTX)

          if (message) {
            logger.log({
              level,
              message,
              ...infoObj,
            })
          }
        },
      }
    },
  }

  return plugin
}

export default apolloServerLoggingMiddlewareFactory
