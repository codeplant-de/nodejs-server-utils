import {CompatibleRequest, CompatibleResponse} from '../types/compatible'

export type ContextToMetaFormatter<
  REQ extends CompatibleRequest | unknown,
  RES extends CompatibleResponse | unknown
> = (req: REQ, res: RES) => Record<string, unknown> | undefined

export const defaultContextToMetaFormatter: ContextToMetaFormatter<
  CompatibleRequest,
  CompatibleResponse
> = () => undefined
