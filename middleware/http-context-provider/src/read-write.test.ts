import {createContextStorage} from './context'
import {getFromHttpContext, storeInHttpContext} from './read-write'

describe('read-write', () => {
  describe('getFromHttpContext', () => {
    test('returns null when called outside of a context', () => {
      expect(getFromHttpContext('foo')).toBeNull()
    })

    test('returns null when key does not exist in context', () => {
      createContextStorage(() => {
        expect(getFromHttpContext('nonexistent')).toBeNull()
      })
    })

    test('returns the value for an existing key', () => {
      createContextStorage(() => {
        storeInHttpContext('foo', 'bar')

        expect(getFromHttpContext('foo')).toBe('bar')
      })
    })

    test('returns the value when using a symbol key', () => {
      const key = Symbol('myKey')

      createContextStorage(() => {
        storeInHttpContext(key, 42)

        expect(getFromHttpContext(key)).toBe(42)
      })
    })

    test('returns undefined (not null) when value was explicitly stored as undefined', () => {
      createContextStorage(() => {
        storeInHttpContext('key', undefined)

        expect(getFromHttpContext('key')).toBeUndefined()
      })
    })

    test('returns null (not undefined) when value was explicitly stored as null', () => {
      createContextStorage(() => {
        storeInHttpContext('key', null)

        expect(getFromHttpContext('key')).toBeNull()
      })
    })

    test('returns the most recently stored value for a key', () => {
      createContextStorage(() => {
        storeInHttpContext('foo', 'first')
        storeInHttpContext('foo', 'second')

        expect(getFromHttpContext('foo')).toBe('second')
      })
    })

    test('can retrieve complex objects', () => {
      const obj = {nested: {deeply: true}, list: [1, 2, 3]}

      createContextStorage(() => {
        storeInHttpContext('data', obj)

        expect(getFromHttpContext('data')).toBe(obj)
      })
    })
  })

  describe('storeInHttpContext', () => {
    test('returns null when called outside of a context', () => {
      expect(storeInHttpContext('foo', 'bar')).toBeNull()
    })

    test('returns the stored value on success', () => {
      createContextStorage(() => {
        const result = storeInHttpContext('foo', 'bar')

        expect(result).toBe('bar')
      })
    })

    test('returns the stored value when using a symbol key', () => {
      const key = Symbol('myKey')

      createContextStorage(() => {
        const result = storeInHttpContext(key, 'value')

        expect(result).toBe('value')
      })
    })

    test('overwrites a previously stored value', () => {
      createContextStorage(() => {
        storeInHttpContext('foo', 'original')
        storeInHttpContext('foo', 'overwritten')

        expect(getFromHttpContext('foo')).toBe('overwritten')
      })
    })

    test('stores multiple independent keys', () => {
      createContextStorage(() => {
        storeInHttpContext('a', 1)
        storeInHttpContext('b', 2)
        storeInHttpContext('c', 3)

        expect(getFromHttpContext('a')).toBe(1)
        expect(getFromHttpContext('b')).toBe(2)
        expect(getFromHttpContext('c')).toBe(3)
      })
    })
  })

  describe('context isolation', () => {
    test('values are not shared between separate contexts', () => {
      createContextStorage(() => {
        storeInHttpContext('foo', 'context1')
      })

      createContextStorage(() => {
        expect(getFromHttpContext('foo')).toBeNull()
      })
    })

    test('values stored in one context are not visible in a sibling context', done => {
      let context1Ready = false

      createContextStorage(() => {
        storeInHttpContext('shared', 'from-context-1')
        context1Ready = true
      })

      expect(context1Ready).toBe(true)

      createContextStorage(() => {
        expect(getFromHttpContext('shared')).toBeNull()
        done()
      })
    })
  })
})
