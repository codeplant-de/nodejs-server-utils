import type {NextHandleFunction} from 'connect'
import cls from 'cls-hooked'

export const namespaceId = '23489a35-8e4f-47e0-9598-fa590c48f84d'

// Initializes context for every inbound request
const httpContextMiddleware: NextHandleFunction = (req, res, next) => {
  const ns = cls.getNamespace(namespaceId) || cls.createNamespace(namespaceId)
  ns.run(() => next())
}

export default httpContextMiddleware
