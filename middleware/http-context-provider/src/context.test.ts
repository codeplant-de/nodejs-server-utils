import {
  createContextStorage,
  getContext,
  getContextStorage,
  createChildContextStorage,
  setInContextStorage,
  getFromContextStorage,
  hasInContextStorage,
} from './context'

describe('context', () => {
  describe('low-level', () => {
    test('data is available within the context', () => {
      const root = getContext()

      root.run(new Map(), () => {
        root.getStore()!.set('foo', 'bar')

        expect(root.getStore()!.get('foo')).toBe('bar')
      })
    })

    test('data is available within the context in nested function calls', () => {
      const ctx = getContext()

      const assertion = (): void => {
        expect(ctx.getStore()!.get('foo')).toBe('bar')
      }

      ctx.run(new Map(), () => {
        ctx.getStore()!.set('foo', 'bar')

        assertion()
      })
    })

    test('data is available within a shared execution scope with sibling functions (data spilling)', () => {
      const root = getContext()

      const settingData = (): void => {
        root.getStore()!.set('foo', 'bar')
      }

      const assertion = (): void => {
        expect(root.getStore()!.get('foo')).toBe('bar')
      }

      root.run(new Map(), () => {
        settingData()

        assertion()
      })
    })

    test('data is not shared between nested contexts', () => {
      const root = getContext()

      root.run(new Map(), () => {
        root.getStore()!.set('foo', 'bar')

        root.run(new Map(), () => {
          expect(root.getStore()!.get('foo')).toBe(undefined)
        })

        expect(root.getStore()!.get('foo')).toBe('bar')
      })
    })

    test('data can be shared between nested contexts', () => {
      const root = getContext()

      root.run(new Map(), () => {
        root.getStore()!.set('foo', 'bar')

        root.run(new Map(root.getStore()!), () => {
          expect(root.getStore()!.get('foo')).toBe('bar')

          root.getStore()!.set('bar', 'baz')
        })

        expect(root.getStore()!.get('foo')).toBe('bar')
        expect(root.getStore()!.get('bar')).toBe(undefined)
      })
    })
  })

  test('can create clean context', () => {
    createContextStorage(() => {
      getContextStorage()?.set('foo', 'bar')

      expect(getContextStorage()?.get('foo')).toBe('bar')
    })
  })

  test('createContextStorage forwards arguments to callback', () => {
    const result = createContextStorage(
      (a: number, b: string) => {
        expect(a).toBe(42)
        expect(b).toBe('hello')
        return a + b.length
      },
      42,
      'hello'
    )

    expect(result).toBe(47)
  })

  test('createContextStorage returns the callback return value', () => {
    const result = createContextStorage(() => 'result-value')

    expect(result).toBe('result-value')
  })

  test('createChildContextStorage forwards arguments to callback', () => {
    createContextStorage(() => {
      const result = createChildContextStorage(
        (x: number, y: number) => {
          expect(x).toBe(10)
          expect(y).toBe(20)
          return x + y
        },
        10,
        20
      )

      expect(result).toBe(30)
    })
  })

  test('createChildContextStorage called outside a context creates a fresh context', () => {
    createChildContextStorage(() => {
      expect(getContextStorage()).toBeDefined()
      expect(getContextStorage()?.size).toBe(0)

      setInContextStorage('key', 'value')
      expect(getFromContextStorage('key')).toBe('value')
    })
  })

  describe('hasInContextStorage', () => {
    test('returns undefined when called outside a context', () => {
      expect(hasInContextStorage('foo')).toBeUndefined()
    })

    test('returns false when key does not exist', () => {
      createContextStorage(() => {
        expect(hasInContextStorage('nonexistent')).toBe(false)
      })
    })

    test('returns true when key exists', () => {
      createContextStorage(() => {
        setInContextStorage('foo', 'bar')
        expect(hasInContextStorage('foo')).toBe(true)
      })
    })

    test('returns true when key exists with undefined value', () => {
      createContextStorage(() => {
        setInContextStorage('foo', undefined)
        expect(hasInContextStorage('foo')).toBe(true)
      })
    })

    test('supports symbol keys', () => {
      const key = Symbol('test')
      createContextStorage(() => {
        setInContextStorage(key, 'value')
        expect(hasInContextStorage(key)).toBe(true)
      })
    })
  })

  describe('setInContextStorage', () => {
    test('returns undefined when called outside a context', () => {
      expect(setInContextStorage('foo', 'bar')).toBeUndefined()
    })

    test('stores a value that can be retrieved', () => {
      createContextStorage(() => {
        setInContextStorage('foo', 'bar')
        expect(getFromContextStorage('foo')).toBe('bar')
      })
    })

    test('supports symbol keys', () => {
      const key = Symbol('test')
      createContextStorage(() => {
        setInContextStorage(key, 42)
        expect(getFromContextStorage(key)).toBe(42)
      })
    })
  })

  describe('getFromContextStorage', () => {
    test('returns undefined when called outside a context', () => {
      expect(getFromContextStorage('foo')).toBeUndefined()
    })

    test('returns undefined for a missing key', () => {
      createContextStorage(() => {
        expect(getFromContextStorage('missing')).toBeUndefined()
      })
    })

    test('returns stored value', () => {
      createContextStorage(() => {
        setInContextStorage('foo', 'bar')
        expect(getFromContextStorage('foo')).toBe('bar')
      })
    })
  })

  test('can create child context', () => {
    createContextStorage(() => {
      setInContextStorage('foo', 'bar')

      createChildContextStorage(() => {
        expect(getFromContextStorage('foo')).toBe('bar')
        ;((): void => {
          setInContextStorage('foo', 'baz')
          setInContextStorage('bar', 'baz')
        })()

        expect(getFromContextStorage('foo')).toBe('baz')
        expect(getFromContextStorage('bar')).toBe('baz')
      })

      expect(getFromContextStorage('foo')).toBe('bar')
      expect(getFromContextStorage('bar')).toBe(undefined)
    })
  })
})
