export interface LogEntry<L extends string = LogLevel> {
  level: L
  message: string
  [metaKey: string]: any
}

export interface LeveledLogMethod {
  (message: string, ...meta: any[]): void
  (infoObject: object): void
}

export interface LogMethod<L extends string> {
  (level: L, message: string, ...meta: any[]): void
  (entry: LogEntry<L>): void
}

export type LeveledLogger<L extends string> = {
  [K in L]: LeveledLogMethod
}

export type Logger<L extends string = LogLevel> = {
  log: LogMethod<L>
  child(meta: object): Logger<L>
  level: L,
} & LeveledLogger<L>

export type LogLevel = 'silent' | 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'
