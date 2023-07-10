import {performance} from 'perf_hooks'

export type TimestampAccessor = () => number

export const defaultTimestampAccessor: TimestampAccessor = () => performance.now()
