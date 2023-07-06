import {
  DEFAULT_SENSITIVE_VARIABLE_LIST,
  HINT_FILTERED,
  NA_IP,
  NA_OPERATION_NAME,
} from '../constants'
import {isObj} from '../utils'
import {CompatibleGraphQLRequest} from '../types/config'

export type RequestToMetaFormatter<T extends CompatibleGraphQLRequest | unknown> = (
  req: T
) => Record<string, unknown> | undefined

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

export const getIpFromGraphQLRequest = (req: CompatibleGraphQLRequest): string | null => {
  const headers = req.http?.headers
  if (!headers) return null

  return headers.get('x-forwarded-for')?.split(',').shift() || null
}

export const defaultRequestToMetaFormatter: RequestToMetaFormatter<
  CompatibleGraphQLRequest
> = req => {
  const variables = req.variables
    ? filterSensitiveVariablesHelper(req.variables, DEFAULT_SENSITIVE_VARIABLE_LIST)
    : undefined

  const operationName = req.operationName || NA_OPERATION_NAME
  const clientIp = getIpFromGraphQLRequest(req) || NA_IP

  return {
    operationName,
    clientIp,
    variables,
  }
}
