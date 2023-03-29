import {
  createContextStorage,
  getContext,
  getContextStorage,
  createChildContextStorage,
  setInContextStorage,
  getFromContextStorage,
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
