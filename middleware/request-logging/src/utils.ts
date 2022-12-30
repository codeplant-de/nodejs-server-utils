import {RequestToMetaFormatter, ResponseToMetaFormatter} from './types/options'

export function mergeFormatters(formatters: RequestToMetaFormatter[]): RequestToMetaFormatter
export function mergeFormatters(formatters: ResponseToMetaFormatter[]): ResponseToMetaFormatter
export function mergeFormatters<F extends RequestToMetaFormatter | ResponseToMetaFormatter>(
  formatters: F[]
): F {
  return ((...arg: any) =>
    formatters.reduce<Record<string, unknown>>((result, formatter) => {
      // @ts-expect-error don't know, don't care now
      Object.assign(result, formatter(...arg))
      return result
    }, {})) as F
}
