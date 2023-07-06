import {CompatibleContext} from '../types/config'

export type ContextToMetaFormatter<T extends CompatibleContext | unknown> = (
  ctx: T
) => Record<string, unknown> | undefined

export const defaultContextToMetaFormatter: ContextToMetaFormatter<
  CompatibleContext | unknown
> = () => undefined
