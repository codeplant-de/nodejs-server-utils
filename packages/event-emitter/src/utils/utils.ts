import {Constructable} from '../types'

export const initializeKlass = <T>(Klass: Constructable<T>): T => new Klass()
