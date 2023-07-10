import {CompatibleResponse} from '../types/compatible'

export type ResponseToMetaFormatter<T extends CompatibleResponse | unknown> = (
  res: T
) => Record<string, unknown> | undefined

export const defaultResponseToMetaFormatter: ResponseToMetaFormatter<CompatibleResponse> = (
  res: CompatibleResponse
): Record<string, unknown> => ({
  statusCode: res.statusCode,
})
