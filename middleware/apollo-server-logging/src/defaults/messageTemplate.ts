import {
  CompatibleContext,
  CompatibleGraphQLRequest,
  CompatibleGraphQLResponse,
} from '../types/config'

export type MessageTemplate<
  REQ extends CompatibleGraphQLRequest | unknown,
  RES extends CompatibleGraphQLResponse | unknown,
  CTX extends CompatibleContext | unknown
> = (req: REQ, res: RES, ctx: CTX) => string | undefined

export const defaultMessageTemplate: MessageTemplate<
  CompatibleGraphQLRequest,
  unknown,
  unknown
> = req => `-> GQL: processed ${req.operationName}`
