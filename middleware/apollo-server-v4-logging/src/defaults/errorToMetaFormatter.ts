import {CompatibleGraphQLError} from '../types/config'

export type ErrorToMetaFormatter<T extends CompatibleGraphQLError | unknown> = (
  err: T
) => Record<string, unknown> | undefined

export const defaultErrorToMetaFormatter: ErrorToMetaFormatter<CompatibleGraphQLError> = err => ({
  ...err,
})
