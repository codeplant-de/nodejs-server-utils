import {CompatibleRequest, CompatibleResponse, LogLevel} from '../types/compatible'

export type LevelFunction =
  | (<REQ extends CompatibleRequest, RES extends CompatibleResponse>(
      req: REQ,
      res: RES
    ) => LogLevel)
  | LogLevel

export const defaultLevelFunction: LevelFunction = 'info'
