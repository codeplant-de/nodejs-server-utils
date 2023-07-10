import {CompatibleRequest, CompatibleResponse} from '../types/compatible'

export type MessageTemplate = <REQ extends CompatibleRequest, RES extends CompatibleResponse>(
  req: REQ,
  res: RES
) => string

export const defaultMessageTemplate = <REQ extends CompatibleRequest>(req: REQ): string =>
  `HTTP ${req.method} ${req.url}`
