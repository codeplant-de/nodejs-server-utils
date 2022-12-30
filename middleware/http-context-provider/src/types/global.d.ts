import {HttpContext as RootHttpContext} from './context'

declare module '@codeplant-de/http-context-provider-middleware' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface HttpContext extends RootHttpContext {}
}
