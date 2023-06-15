import {ContainerType, Constructable} from '../types'
import {initializeKlass} from './utils'

export class SimpleContainer implements ContainerType {
  private readonly instances = new WeakMap()

  get<T>(someClass: Constructable<T>): T {
    if (this.instances.has(someClass)) {
      return this.instances.get(someClass)
    }

    const instance = initializeKlass<T>(someClass)
    this.instances.set(someClass, instance)

    return instance
  }
}
