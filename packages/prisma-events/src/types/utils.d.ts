export type CustomMethodDecorator<T> = (
  target: Object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void

export type HasDefaults<O, K extends keyof O> = Omit<O, K> & Partial<Pick<O, K>>
