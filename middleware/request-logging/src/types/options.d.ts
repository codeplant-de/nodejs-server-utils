import {IncomingMessage, ServerResponse} from 'node:http'
import type {Request, Response} from 'express'
import type {Logger} from '@codeplant-de/nodejs-server-logger'

export type RequestToMetaFormatter<T extends IncomingMessage | Request = IncomingMessage> = (
  req: T
) => Record<string, unknown> | undefined

export type ResponseToMetaFormatter<T extends ServerResponse | Response = ServerResponse> = (
  res: T
) => Record<string, unknown> | undefined

export type DynamicLevelFunction = (
  req: IncomingMessage,
  res: ServerResponse,
  err?: Error
) => string

export interface Options<
  REQ extends IncomingMessage | Request = IncomingMessage,
  RES extends ServerResponse | Response = ServerResponse
> {
  requestToMeta: RequestToMetaFormatter<REQ> | RequestToMetaFormatter<REQ>[]

  responseToMeta: ResponseToMetaFormatter<RES> | ResponseToMetaFormatter<RES>[]

  skip: (req: REQ, res: RES) => boolean

  messageTemplate: (req: REQ, res: RES) => string

  loggerAccessor: (req: REQ) => Pick<Logger, 'log'>

  level: string | DynamicLevelFunction

  baseMeta: Record<string, unknown>

  metaField: string | null

  reqField: string | null

  resField: string | null

  timestampAccessor: () => number

  hook: 'on-headers' | 'on-finished'
}
