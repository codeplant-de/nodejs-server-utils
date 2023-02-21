import type {GraphQLRequest, GraphQLResponse, BaseContext} from 'apollo-server-types'
import type {GraphQLFormattedError, GraphQLError} from 'graphql'
import type {Logger} from '@codeplant-de/nodejs-server-logger'

export type RequestToMetaFormatter<T extends GraphQLRequest = GraphQLRequest> = (
  req: T
) => Record<string, unknown> | undefined

export type ResponseToMetaFormatter<T extends GraphQLResponse = GraphQLResponse> = (
  res: T
) => Record<string, unknown> | undefined

export type ErrorToMetaFormatter<
  T extends GraphQLFormattedError | GraphQLError = GraphQLFormattedError | GraphQLError
> = (err: T) => Record<string, unknown> | undefined

export type ContextToMetaFormatter<T extends BaseContext = BaseContext> = (
  ctx: T
) => Record<string, unknown> | undefined

export type DynamicLevelFunction<
  REQ extends GraphQLRequest | unknown = GraphQLRequest,
  RES extends GraphQLResponse | unknown = GraphQLResponse,
  CTX extends BaseContext | unknown = BaseContext,
  ERR extends GraphQLFormattedError | GraphQLError | unknown = GraphQLFormattedError | GraphQLError
> = (req: REQ, res: RES, ctx: CTX, err?: ReadonlyArray<ERR>) => string

export type SkipFunction<
  REQ extends GraphQLRequest = GraphQLRequest,
  RES extends GraphQLResponse = GraphQLResponse,
  CTX extends BaseContext = BaseContext,
  ERR extends GraphQLFormattedError | GraphQLError = GraphQLFormattedError | GraphQLError
> = (req: REQ, res?: RES, ctx: CTX, err?: ReadonlyArray<ERR>) => boolean

export type ErrorMessageTemplate<
  REQ extends GraphQLRequest = GraphQLRequest,
  RES extends GraphQLResponse = GraphQLResponse,
  CTX extends BaseContext = BaseContext,
  ERR extends GraphQLFormattedError | GraphQLError = GraphQLFormattedError | GraphQLError
> = (req: REQ, res: RES, ctx: CTX, err: ReadonlyArray<ERR>) => string | undefined

export type MessageTemplate<
  REQ extends GraphQLRequest = GraphQLRequest,
  RES extends GraphQLResponse = GraphQLResponse,
  CTX extends BaseContext = BaseContext
> = (req: REQ, res: RES, ctx: CTX) => string | undefined

export type Config<
  CTX extends BaseContext = BaseContext,
  REQ extends GraphQLRequest = GraphQLRequest,
  RES extends GraphQLResponse = GraphQLResponse,
  ERR extends GraphQLFormattedError | GraphQLError = GraphQLFormattedError | GraphQLError
> = {
  loggerAccessor: (req: REQ, ctx: CTX) => Pick<Logger, 'log'>

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

  timestampAccessor: () => number

  errorMessageTemplate: ErrorMessageTemplate<REQ, RES, CTX, ERR>

  messageTemplate: MessageTemplate<REQ, RES, CTX>
}
