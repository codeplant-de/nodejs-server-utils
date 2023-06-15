import '@codeplant-de/http-context-provider-middleware'
import type {Logger} from '@codeplant-de/nodejs-server-logger'

declare module '@codeplant-de/http-context-provider-middleware' {
  export interface HttpContext {
    'request-id': string

    logger: Logger
  }
}
