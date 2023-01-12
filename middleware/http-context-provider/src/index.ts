import middleware from './middleware'

export {namespaceId as httpContextNamespaceId, getClsNamespace} from './middleware'
export {getFromHttpContext, storeInHttpContext} from './read-write'

export default middleware

export type {HttpContextKey, HttpContext} from './types/context'
