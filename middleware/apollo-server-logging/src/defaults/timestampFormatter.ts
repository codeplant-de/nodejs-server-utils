export type TimestampFormatter = (timestamp: number) => number

export const defaultTimestampFormatter: TimestampFormatter = (hTimestamp: number): number =>
  Math.round(hTimestamp * 1e4) / 1e4
