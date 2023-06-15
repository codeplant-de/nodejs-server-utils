export type SimpleLogger = (m: string) => void

export type CompatibleLogger = {
  silly: SimpleLogger
  warn: SimpleLogger
}
