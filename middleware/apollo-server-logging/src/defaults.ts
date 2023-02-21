import type {GraphQLResponse, BaseContext} from 'apollo-server-types'
import type {GraphQLFormattedError, GraphQLError} from 'graphql'
import type {
  ContextToMetaFormatter,
  ErrorMessageTemplate,
  ErrorToMetaFormatter,
  MessageTemplate,
  RequestToMetaFormatter,
  ResponseToMetaFormatter,
} from './types/config'
import {filterSensitiveVariablesHelper, getIpFromGraphQLRequest} from './utils'
import {DEFAULT_SENSITIVE_VARIABLE_LIST, NA_IP, NA_OPERATION_NAME} from './constants'
import {DynamicLevelFunction} from './types/config'

export const defaultRequestToMetaFormatter: RequestToMetaFormatter = req => {
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

export const defaultResponseToMetaFormatter: ResponseToMetaFormatter<GraphQLResponse> = () =>
  undefined

export const defaultContextToMetaFormatter: ContextToMetaFormatter<BaseContext> = () => undefined

export const defaultErrorToMetaFormatter: ErrorToMetaFormatter<
  GraphQLFormattedError | GraphQLError
> = err => ({
  ...err,
})

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

export const defaultErrorMessageTemplate: ErrorMessageTemplate = (req, _res, _ctx, err) => {
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

export const defaultMessageTemplate: MessageTemplate = req =>
  `-> GQL: processed ${req.operationName}`
