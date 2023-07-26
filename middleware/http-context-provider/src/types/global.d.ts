import {HttpContext as RootHttpContext} from './context'

declare module '@codeplant-de/http-context-provider-middleware' {
  interface HttpContext extends RootHttpContext {}
}
