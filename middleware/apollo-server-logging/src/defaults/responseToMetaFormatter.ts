import {CompatibleGraphQLResponse} from '../types/config'

export type ResponseToMetaFormatter<T extends CompatibleGraphQLResponse | unknown> = (
  res: T
) => Record<string, unknown> | undefined

export const defaultResponseToMetaFormatter: ResponseToMetaFormatter<unknown> = () => undefined
