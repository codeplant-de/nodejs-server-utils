import {CompatibleRequest, CompatibleResponse, CompatibleLogger} from './compatible'
import {
  ContextToMetaFormatter,
  LevelFunction,
  MessageTemplate,
  RequestToMetaFormatter,
  ResponseToMetaFormatter,
  SkipFunction,
  TimestampAccessor,
} from '../defaults'

export interface Options<
  REQ extends CompatibleRequest | unknown,
  RES extends CompatibleResponse | unknown
> {
  requestToMeta: RequestToMetaFormatter<REQ> | RequestToMetaFormatter<REQ>[]

  responseToMeta: ResponseToMetaFormatter<RES> | ResponseToMetaFormatter<RES>[]

  contextToMeta: ContextToMetaFormatter<REQ, RES> | ContextToMetaFormatter<REQ, RES>[]

  skip: SkipFunction<REQ, RES>

  messageTemplate: MessageTemplate<REQ, RES>

  loggerAccessor: (req: REQ) => CompatibleLogger

  level: string | LevelFunction

  baseMeta: Record<string, unknown>

  metaField: string | null

  reqField: string | null

  resField: string | null

  ctxField: string | null

  timestampAccessor: TimestampAccessor

  hook: 'on-headers' | 'on-finished'
}
