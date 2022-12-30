import type {NextHandleFunction, IncomingMessage} from 'connect'
import httpContextProviderMiddleware, {
  storeInHttpContext,
} from '@codeplant-de/http-context-provider-middleware'
import loggerProviderMiddlewareFactory from '@codeplant-de/logger-provider-middleware'
import requestIdProviderMiddlewareFactory from '@codeplant-de/request-id-provider-middleware'
import requestLoggingMiddlewareFactory from '@codeplant-de/request-logging-middleware'

import {
  isEnabledContextProviderOption,
  isEnabledLoggerProviderOption,
  isEnabledRequestIdProviderOption,
  isEnabledRequestLoggingOption,
} from './utils'
import {CONTEXT_KEY_LOGGER, CONTEXT_KEY_REQUEST_ID} from './constants'
import {CreateMiddlewareStackOptions} from './types/options'

class MiddlewareStack extends Array<NextHandleFunction> {
  attach(to: {use: (middleware: NextHandleFunction) => void}): void {
    this.forEach(middleware => to.use(middleware))
  }
}

export const defaultCreateMiddlewareStackOptions = {
  withHttpContextProvider: true,
  withRequestIdProvider: true,
  withLoggerProvider: true,
  withRequestLogging: true,
} satisfies Partial<CreateMiddlewareStackOptions>

const createMiddlewareStack = (userOptions: CreateMiddlewareStackOptions): MiddlewareStack => {
  const options = {
    ...defaultCreateMiddlewareStackOptions,
    ...userOptions,
  }

  const middlewareStack = new MiddlewareStack()

  if (isEnabledContextProviderOption(options)) {
    middlewareStack.push(httpContextProviderMiddleware)
  }

  if (isEnabledRequestIdProviderOption(options)) {
    const {requestIdProviderOptions} = options
    middlewareStack.push(
      requestIdProviderMiddlewareFactory({
        ...requestIdProviderOptions,
        contextSetter: requestId => storeInHttpContext(CONTEXT_KEY_REQUEST_ID, requestId),
      })
    )
  }

  if (isEnabledLoggerProviderOption(options)) {
    const {loggerProviderOptions} = options
    middlewareStack.push(
      loggerProviderMiddlewareFactory({
        logger: loggerProviderOptions.logger,
        childLoggerMeta: req => ({requestId: req.requestId}),
        contextSetter: logger => storeInHttpContext(CONTEXT_KEY_LOGGER, logger),
      })
    )
  }

  if (isEnabledRequestLoggingOption(options)) {
    const {requestLoggingOptions, withLoggerProvider} = options
    middlewareStack.push(
      requestLoggingMiddlewareFactory({
        ...requestLoggingOptions,
        loggerAccessor:
          withLoggerProvider !== false
            ? (req: IncomingMessage): IncomingMessage['logger'] => req.logger
            : requestLoggingOptions.loggerAccessor,
      })
    )
  }

  return middlewareStack
}

export default createMiddlewareStack
