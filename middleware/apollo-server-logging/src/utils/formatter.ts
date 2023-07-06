export type GenericFormatter<I extends any[], R = any> = (...input: I) => R

export function mergeFormatters<
  I extends any[],
  R extends Record<string, unknown> | undefined = any
>(formatters: GenericFormatter<I, R>[]): GenericFormatter<I, R> {
  return (...input: I) =>
    formatters.reduce<Record<string, unknown>>((result, formatter) => {
      Object.assign(result, formatter(...input))
      return result
    }, {}) as R
}
