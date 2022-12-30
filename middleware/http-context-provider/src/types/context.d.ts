export interface HttpContext {
  [k: string | symbol]: unknown
}

export type HttpContextKey = keyof HttpContext
