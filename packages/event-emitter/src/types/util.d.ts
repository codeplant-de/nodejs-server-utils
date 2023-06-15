export type Constructable<T> = new (...args: any[]) => T

export type HasDefaults<O, K extends keyof O> = Omit<O, K> & Partial<Pick<O, K>>
