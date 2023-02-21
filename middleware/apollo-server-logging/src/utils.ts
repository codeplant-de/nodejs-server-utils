import type {GraphQLRequest} from 'apollo-server-types'
import {HINT_FILTERED} from './constants'

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && Array.isArray(v) === false

export const filterSensitiveVariablesHelper = (
  variables: Record<string, unknown>,
  sensitiveVariableList: string[]
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(variables).map(([key, value]) => {
      if (sensitiveVariableList.includes(key)) {
        return [key, HINT_FILTERED]
      }
      if (isObj(value)) {
        return [key, filterSensitiveVariablesHelper(value, sensitiveVariableList)]
      }
      return [key, value]
    })
  )

export const getIpFromGraphQLRequest = (req: GraphQLRequest): string | null => {
  const headers = req.http?.headers
  if (!headers) return null

  return headers.get('x-forwarded-for')?.split(',').shift() || null
}

/**
 * shortens a timestamp to max 4 decimals
 * @param hTimestamp
 */
export const formatTimestamp = (hTimestamp: number): number => Math.round(hTimestamp * 1e4) / 1e4

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

export const assignMeta = (
  meta: Record<string, unknown>,
  data: Record<string, unknown>,
  propertyKey?: string | undefined | null | false
): void => {
  if (propertyKey) {
    const prevData = meta[propertyKey]
    if (prevData && typeof prevData === 'object') {
      Object.assign(prevData, data)
    } else {
      // eslint-disable-next-line no-param-reassign
      meta[propertyKey] = data
    }
  } else {
    Object.assign(meta, data)
  }
}

export const assignArrayMeta = (
  meta: Record<string, unknown>,
  data: unknown[],
  propertyKey: string
): void => {
  const prevData = meta[propertyKey]
  if (prevData && Array.isArray(prevData)) {
    prevData.push(...data)
  } else {
    // eslint-disable-next-line no-param-reassign
    meta[propertyKey] = data
  }
}
