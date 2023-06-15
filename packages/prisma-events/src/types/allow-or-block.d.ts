export type SingleModelDefinition = {model: string}
export type SingleOperationDefinition = {operation: string}
export type MultipleModelsDefinition = {models: string[]}
export type MultipleOperationsDefinition = {operations: string[]}

export type AllowOrBlockDefinition =
  | SingleModelDefinition
  | SingleOperationDefinition
  | MultipleModelsDefinition
  | MultipleOperationsDefinition
  | (SingleModelDefinition & SingleOperationDefinition)
  | (SingleModelDefinition & MultipleOperationsDefinition)
  | (MultipleModelsDefinition & SingleOperationDefinition)
  | (MultipleModelsDefinition & MultipleOperationsDefinition)
