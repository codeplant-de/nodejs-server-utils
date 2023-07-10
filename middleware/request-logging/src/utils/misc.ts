/* eslint-disable no-param-reassign */
import {FILTERED_INDICATOR} from '../constants'
import {isObj} from './type-guards'

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

/**
 * shortens a timestamp to max 4 decimals
 * @param hTimestamp
 */
export const formatTimestamp = (hTimestamp: number): number => Math.round(hTimestamp * 1e4) / 1e4

export const filterSensitiveVariablesHelper = <K extends string, V = unknown>(
  variables: Record<K, V>,
  sensitiveVariableList: ReadonlyArray<string>
): Record<K, V | string> =>
  (Object.entries(variables) as [K, V][]).reduce<Record<K, V | string>>((result, [key, value]) => {
    if (sensitiveVariableList.includes(key as any)) {
      result[key] = FILTERED_INDICATOR
    } else if (isObj(value)) {
      // @ts-expect-error don't want to deal with it now
      result[key] = filterSensitiveVariablesHelper(value, sensitiveVariableList)
    } else {
      result[key] = value
    }

    return result
  }, {} as Record<K, V | string>) as Record<K, V | string>
