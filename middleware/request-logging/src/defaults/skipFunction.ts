import {CompatibleRequest, CompatibleResponse} from '../types/compatible'

export type SkipFunction<REQ extends CompatibleRequest, RES extends CompatibleResponse> = (
  req: REQ,
  res: RES
) => boolean

export const defaultSkipFunction: SkipFunction<CompatibleRequest, CompatibleResponse> = () => false
