// noinspection RedundantIfStatementJS

import {
  AllowOrBlockDefinition,
  MultipleModelsDefinition,
  MultipleOperationsDefinition,
  SingleModelDefinition,
  SingleOperationDefinition,
} from '../types'

const isSingleModelDefinition = (def: AllowOrBlockDefinition): def is SingleModelDefinition =>
  'model' in def

const isSingleOperationDefinition = (
  def: AllowOrBlockDefinition
): def is SingleOperationDefinition => 'operation' in def

const isMultipleModelDefinition = (def: AllowOrBlockDefinition): def is MultipleModelsDefinition =>
  'models' in def

const isMultipleOperationsDefinition = (
  def: AllowOrBlockDefinition
): def is MultipleOperationsDefinition => 'operations' in def

const buildRules = (list: AllowOrBlockDefinition[]): Record<string, string[]> =>
  list.reduce<Record<string, string[]>>((m, rule) => {
    if (isSingleModelDefinition(rule)) {
      // eslint-disable-next-line no-param-reassign
      if (!m[rule.model]) m[rule.model] = []

      if (isSingleOperationDefinition(rule)) {
        m[rule.model].push(rule.operation)
      } else if (isMultipleOperationsDefinition(rule)) {
        m[rule.model].push(...rule.operations)
      }
    } else if (isMultipleModelDefinition(rule)) {
      rule.models.forEach(model => {
        // eslint-disable-next-line no-param-reassign
        if (!m[model]) m[model] = []

        if (isSingleOperationDefinition(rule)) {
          m[model].push(rule.operation)
        } else if (isMultipleOperationsDefinition(rule)) {
          m[model].push(...rule.operations)
        }
      })
    } else if (isSingleOperationDefinition(rule)) {
      // eslint-disable-next-line no-param-reassign
      if (!m['*']) m['*'] = []

      m['*'].push(rule.operation)
    } else if (isMultipleOperationsDefinition(rule)) {
      // eslint-disable-next-line no-param-reassign
      if (!m['*']) m['*'] = []

      m['*'].push(...rule.operations)
    }
    return m
  }, {})

const shouldTriggerEventFactory = (
  allowList: AllowOrBlockDefinition[] = [],
  blockList: AllowOrBlockDefinition[] = []
): ((model: string | undefined, operation: string) => boolean) => {
  if (allowList.length > 0 && blockList.length > 0)
    throw new Error('Invalid options, only allowList OR blockList can be passed')
  if (allowList.length === 0 && blockList.length === 0) return () => true

  if (allowList.length > 0 && blockList.length === 0) {
    const rules = buildRules(allowList)

    return (model: string | undefined, operation: string): boolean => {
      if (typeof model === 'undefined') {
        return rules['*'] && rules['*'].includes(operation)
      }
      if (rules[model]) {
        // all operations on model are allowed
        if (rules[model].length === 0) {
          return true
        }
        // operation on specific model is allowed
        if (rules[model].includes(operation)) {
          return true
        }
      }
      // operation is globally allowed
      if (rules['*'].includes(operation)) {
        return true
      }
      return false
    }
  }

  const rules = buildRules(blockList)

  return (model: string | undefined, operation: string): boolean => {
    if (typeof model === 'undefined') {
      return !rules['*'] || !rules['*'].includes(operation)
    }
    if (rules[model]) {
      // all operations on model are forbidden
      if (rules[model].length === 0) {
        return false
      }
      // operation is forbidden on specific model
      if (rules[model].includes(operation)) {
        return false
      }
    }
    // operation is forbidden globally
    if (rules['*'].includes(operation)) {
      return false
    }
    return true
  }
}

export default shouldTriggerEventFactory
