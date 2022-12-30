import '@codeplant-de/http-context-provider-middleware'

declare module '@codeplant-de/http-context-provider-middleware' {
  import type {Logger} from '@codeplant-de/nodejs-server-logger'

  export interface HttpContext {
    'request-id': string

    logger: Logger
  }
}
