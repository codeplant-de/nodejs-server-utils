export type UnknownEventMap = Record<string, unknown[]>

export type ConcreteEventMap<E> = E extends ApplicationEventEmitter<infer M> ? M : UnknownEventMap

export interface ApplicationEvents {
  [key: string]: unknown[]
}

export interface EmitEventFunc<EventMap extends UnknownEventMap> {
  <E extends keyof EventMap>(event: E, ...args: EventMap[E]): void
}

export interface AsyncEmitEventFunc<EventMap extends UnknownEventMap> {
  <E extends keyof EventMap>(event: E, ...args: EventMap[E]): Promise<void>
}

export interface OnEventFunc<EventMap extends UnknownEventMap> {
  <E extends keyof EventMap>(
    event: E,
    cb: (...args: EventMap[E]) => any,
    options?: {async?: boolean}
  ): void
}

/**
 * Simplified interface for an event emitter
 */
export interface ApplicationEventEmitter<EventMap extends UnknownEventMap = ApplicationEvents> {
  emit: EmitEventFunc<EventMap>
  emitAsync: AsyncEmitEventFunc<EventMap>
  on: OnEventFunc<EventMap>
  once: OnEventFunc<EventMap>
}
