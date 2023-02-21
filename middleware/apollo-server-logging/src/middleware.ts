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
import {assignArrayMeta, assignMeta, formatTimestamp} from './utils'

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
    requestDidStart: async ({
      request,
    }: GraphQLRequestContext<CTX>): Promise<GraphQLRequestListener<CTX>> => {
      const startTimestamp = config.timestampAccessor()

      const meta: Record<string, unknown> = {...config.baseMeta}

      if (config.requestToMeta) {
        const reqMeta = config.requestToMeta(request as REQ)
        if (reqMeta) {
          assignMeta(meta, reqMeta, config.reqField)
        }
      }

      return {
        willSendResponse: async ({errors, response, context}): Promise<void> => {
          meta.duration = formatTimestamp(config.timestampAccessor() - startTimestamp)

          if (config.responseToMeta) {
            const resMeta = config.responseToMeta(response as RES)
            if (resMeta) {
              assignMeta(meta, resMeta, config.resField)
            }
          }
          if (config.contextToMeta) {
            const ctxMeta = config.contextToMeta(context)
            if (ctxMeta) {
              assignMeta(meta, ctxMeta, config.ctxField)
            }
          }

          if (config.errorToMeta && errors) {
            const formatter = config.errorToMeta
            const errMeta = errors.map(err => formatter(err as ERR)).filter(Boolean)
            if (errMeta.length > 0) {
              assignArrayMeta(meta, errMeta, config.errField)
            }
          }

          const infoObj: Record<string, unknown> = {}

          assignMeta(infoObj, meta, config.metaField)

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
              ...infoObj,
              level,
              message,
            })
          }
        },
      }
    },
  }

  return plugin
}

export default apolloServerLoggingMiddlewareFactory
