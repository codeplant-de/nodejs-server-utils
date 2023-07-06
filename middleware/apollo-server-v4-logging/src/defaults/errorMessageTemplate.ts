import {
  CompatibleContext,
  CompatibleGraphQLError,
  CompatibleGraphQLRequest,
  CompatibleGraphQLResponse,
} from '../types/config'

export type ErrorMessageTemplate<
  REQ extends CompatibleGraphQLRequest | unknown,
  RES extends CompatibleGraphQLResponse | unknown,
  CTX extends CompatibleContext | unknown,
  ERR extends CompatibleGraphQLError | unknown
> = (req: REQ, res: RES, ctx: CTX, err: ReadonlyArray<ERR>) => string | undefined

export const defaultErrorMessageTemplate: ErrorMessageTemplate<
  CompatibleGraphQLRequest,
  CompatibleGraphQLResponse | unknown,
  CompatibleContext | unknown,
  CompatibleGraphQLError
> = (req, _res, _ctx, err) => {
  if (err && err.length) {
    // do something fancy with our errors
    const errorCodes = err.map(e => e.extensions?.code).filter(Boolean)
    if (errorCodes.length > 0) {
      return `-X GQL: "${errorCodes.join('", "')}" error${
        errorCodes.length > 1 ? 's' : ''
      } while processing ${req.operationName}`
    }
  }
  return `-X GQL: error while processing ${req.operationName}`
}
