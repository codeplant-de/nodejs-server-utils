import type {NextHandleFunction} from 'connect'
import httpContextProviderMiddleware, {
  storeInHttpContext,
} from '@codeplant-de/http-context-provider-middleware'
import loggerProviderMiddlewareFactory, {
  LoggerProviderOptions,
} from '@codeplant-de/logger-provider-middleware'
import requestIdProviderMiddlewareFactory, {
  RequestIdProviderOptions,
} from '@codeplant-de/request-id-provider-middleware'

import {CONTEXT_KEY_LOGGER, CONTEXT_KEY_REQUEST_ID} from './constants'

type WithContextProvider = {
  withHttpContextProvider?: boolean
}

type WithRequestIdProvider =
  | {
      withRequestIdProvider?: false
      requestIdProviderOptions?: Omit<RequestIdProviderOptions, 'contextSetter'>
    }
  | {
      withRequestIdProvider: true
      withHttpContextProvider: true
      requestIdProviderOptions?: Omit<RequestIdProviderOptions, 'contextSetter'>
    }

type WithLoggerProvider =
  | {
      withLoggerProvider?: false
      loggerProviderOptions?: Omit<LoggerProviderOptions, 'contextSetter'>
    }
  | {
      withLoggerProvider: true
      loggerProviderOptions: Omit<LoggerProviderOptions, 'contextSetter'>
    }

export type CreateMiddlewareStackOptions = {} & WithContextProvider &
  WithRequestIdProvider &
  WithLoggerProvider

class MiddlewareStack extends Array<NextHandleFunction> {
  attach(to: {use: (middleware: NextHandleFunction) => void}): void {
    this.forEach(middleware => to.use(middleware))
  }
}

const createMiddlewareStack = ({
  withHttpContextProvider,
  withRequestIdProvider,
  requestIdProviderOptions,
  withLoggerProvider,
  loggerProviderOptions,
}: CreateMiddlewareStackOptions = {}): MiddlewareStack => {
  const middlewareStack = new MiddlewareStack()

  if (withHttpContextProvider) {
    middlewareStack.push(httpContextProviderMiddleware)
  }

  if (withRequestIdProvider) {
    middlewareStack.push(
      requestIdProviderMiddlewareFactory({
        ...requestIdProviderOptions,
        contextSetter: requestId => storeInHttpContext(CONTEXT_KEY_REQUEST_ID, requestId),
      })
    )
  }

  if (withLoggerProvider) {
    middlewareStack.push(
      loggerProviderMiddlewareFactory({
        logger: loggerProviderOptions.logger,
        childLoggerMeta: req => ({requestId: req.requestId}),
        contextSetter: logger => storeInHttpContext(CONTEXT_KEY_LOGGER, logger),
      })
    )
  }

  return middlewareStack
}

export default createMiddlewareStack
