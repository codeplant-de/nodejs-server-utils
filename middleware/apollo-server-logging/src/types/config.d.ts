import type {GraphQLError, GraphQLFormattedError} from 'graphql'
import type {BaseContext, GraphQLRequest, GraphQLResponse} from 'apollo-server-plugin-base'
import {
  DynamicLevelFunction,
  RequestToMetaFormatter,
  ResponseToMetaFormatter,
  ContextToMetaFormatter,
  ErrorToMetaFormatter,
  SkipFunction,
  ErrorMessageTemplate,
  MessageTemplate,
  TimestampFormatter,
  TimestampAccessor,
} from '../defaults'

export type CompatibleLogger = {
  log(infoObj: Record<string, any>): any
}

export type CompatibleContext = BaseContext

export type CompatibleGraphQLRequest = GraphQLRequest

export type CompatibleGraphQLResponse = GraphQLResponse

export type CompatibleGraphQLError = GraphQLFormattedError | GraphQLError

export type Config<
  CTX extends CompatibleContext | unknown,
  REQ extends CompatibleGraphQLRequest | unknown,
  RES extends CompatibleGraphQLResponse | unknown,
  ERR extends CompatibleGraphQLError | unknown
> = {
  loggerAccessor: (req: REQ, ctx: CTX) => CompatibleLogger

  level: string | DynamicLevelFunction<REQ, RES, CTX, ERR>

  requestToMeta: RequestToMetaFormatter<REQ> | false

  responseToMeta: ResponseToMetaFormatter<RES> | false

  contextToMeta: ContextToMetaFormatter<CTX> | false

  errorToMeta: ErrorToMetaFormatter<ERR> | false

  skip: SkipFunction<REQ, RES, ERR>

  baseMeta: Record<string, unknown>

  metaField: string | null

  reqField: string | null

  resField: string | null

  ctxField: string | null

  errField: string

  timestampAccessor: TimestampAccessor

  timestampFormatter: TimestampFormatter

  errorMessageTemplate: ErrorMessageTemplate<REQ, RES, CTX, ERR>

  messageTemplate: MessageTemplate<REQ, RES, CTX>
}
