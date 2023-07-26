import type {
  ApolloServerPlugin,
  GraphQLRequestContext,
  GraphQLRequestListener,
  GraphQLRequestContextWillSendResponse,
} from '@apollo/server'

import {
  CompatibleContext,
  CompatibleGraphQLError,
  CompatibleGraphQLRequest,
  CompatibleGraphQLResponse,
  Config,
} from './types/config'
import {
  defaultContextToMetaFormatter,
  defaultErrorMessageTemplate,
  defaultErrorToMetaFormatter,
  defaultLevelFunction,
  defaultMessageTemplate,
  defaultRequestToMetaFormatter,
  defaultResponseToMetaFormatter,
  defaultSkipFunction,
  defaultTimestampFormatter,
  defaultTimestampAccessor,
} from './defaults'
import {assignArrayMeta, assignMeta} from './utils'

export type ApolloServerLoggingConfig<
  CTX extends CompatibleContext | unknown,
  REQ extends CompatibleGraphQLRequest | unknown = CompatibleGraphQLRequest,
  RES extends CompatibleGraphQLResponse | unknown = CompatibleGraphQLResponse,
  ERR extends CompatibleGraphQLError | unknown = CompatibleGraphQLError
> = Partial<Config<CTX, REQ, RES, ERR>> &
  Pick<Required<Config<CTX, REQ, RES, ERR>>, 'loggerAccessor'>

export const defaultConfig = {
  requestToMeta: defaultRequestToMetaFormatter,
  level: defaultLevelFunction,
  responseToMeta: defaultResponseToMetaFormatter,
  contextToMeta: defaultContextToMetaFormatter,
  errorToMeta: defaultErrorToMetaFormatter,
  skip: defaultSkipFunction,
  baseMeta: {},
  metaField: 'meta',
  reqField: 'req',
  resField: 'res',
  ctxField: 'ctx',
  errField: 'err',
  timestampAccessor: defaultTimestampAccessor,
  errorMessageTemplate: defaultErrorMessageTemplate,
  messageTemplate: defaultMessageTemplate,
  timestampFormatter: defaultTimestampFormatter,
} satisfies Omit<
  Config<
    CompatibleContext,
    CompatibleGraphQLRequest,
    CompatibleGraphQLResponse,
    CompatibleGraphQLError
  >,
  'loggerAccessor'
>

function apolloServerLoggingMiddlewareFactory<
  CTX extends CompatibleContext,
  REQ extends CompatibleGraphQLRequest = CompatibleGraphQLRequest,
  RES extends CompatibleGraphQLResponse = CompatibleGraphQLResponse,
  ERR extends CompatibleGraphQLError = CompatibleGraphQLError
>(userConfig: ApolloServerLoggingConfig<CTX, REQ, RES, ERR>): ApolloServerPlugin<CTX> {
  const config = {
    ...defaultConfig,
    ...userConfig,
  }

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
        willSendResponse: async ({
          errors,
          response,
          contextValue,
        }: GraphQLRequestContextWillSendResponse<CTX>): Promise<void> => {
          meta.duration = config.timestampFormatter(config.timestampAccessor() - startTimestamp)

          if (config.responseToMeta) {
            const resMeta = config.responseToMeta(response as RES)
            if (resMeta) {
              assignMeta(meta, resMeta, config.resField)
            }
          }
          if (config.contextToMeta) {
            const ctxMeta = config.contextToMeta(contextValue)
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
                  contextValue as CTX,
                  errors as ReadonlyArray<ERR> | undefined
                )

          const message = errors
            ? config.errorMessageTemplate(
                request as REQ,
                response as RES,
                contextValue as CTX,
                errors as ReadonlyArray<ERR>
              )
            : config.messageTemplate(request as REQ, response as RES, contextValue as CTX)

          const logger = config.loggerAccessor(request as REQ, contextValue as CTX)

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
