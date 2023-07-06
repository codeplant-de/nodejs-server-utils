import {
  CompatibleContext,
  CompatibleGraphQLError,
  CompatibleGraphQLRequest,
  CompatibleGraphQLResponse,
} from '../types/config'

export type DynamicLevelFunction<
  REQ extends CompatibleGraphQLRequest | unknown,
  RES extends CompatibleGraphQLResponse | unknown,
  CTX extends CompatibleContext | unknown,
  ERR extends CompatibleGraphQLError | unknown
> = (req: REQ, res: RES, ctx: CTX, err?: ReadonlyArray<ERR>) => string

/**
 * We are logging as error if at least one error occurred or info if not
 */
export const defaultLevelFunction: DynamicLevelFunction<unknown, unknown, unknown, unknown> = (
  _req,
  _res,
  _ctx,
  err
): string => {
  if (err && err.length > 0) return 'error'
  return 'info'
}
