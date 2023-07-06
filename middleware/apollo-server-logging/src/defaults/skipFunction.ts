import {
  CompatibleContext,
  CompatibleGraphQLError,
  CompatibleGraphQLRequest,
  CompatibleGraphQLResponse,
} from '../types/config'

export type SkipFunction<
  REQ extends CompatibleGraphQLRequest | unknown,
  RES extends CompatibleGraphQLResponse | unknown,
  CTX extends CompatibleContext | unknown,
  ERR extends CompatibleGraphQLError | unknown
> = (req: REQ, res: RES | undefined, ctx: CTX, err?: ReadonlyArray<ERR>) => boolean

export const defaultSkipFunction: SkipFunction<unknown, unknown, unknown, unknown> = () => false
