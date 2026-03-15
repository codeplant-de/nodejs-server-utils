import {assignMeta} from './meta'

describe('utils', () => {
  describe('assignMeta', () => {
    it('properly assigns data to the root object if property key is missing', () => {
      const rootMeta = {foo: 'bar'}
      const data = {bar: 'baz'}

      assignMeta(rootMeta, data)

      expect(rootMeta).toStrictEqual({foo: 'bar', bar: 'baz'})
    })

    it('properly assigns data to a new object with the given property key', () => {
      const rootMeta = {foo: 'bar'}
      const data = {bar: 'baz'}

      assignMeta(rootMeta, data, 'subFoo')

      expect(rootMeta).toStrictEqual({foo: 'bar', subFoo: {bar: 'baz'}})
    })

    it('properly assigns data to a existing object with the given property key', () => {
      const rootMeta = {foo: 'bar', subFoo: {subBar: true}}
      const data = {bar: 'baz'}

      assignMeta(rootMeta, data, 'subFoo')

      expect(rootMeta).toStrictEqual({foo: 'bar', subFoo: {subBar: true, bar: 'baz'}})
    })

    it('assigns to root when propertyKey is null', () => {
      const meta: Record<string, unknown> = {existing: true}

      assignMeta(meta, {added: 'value'}, null)

      expect(meta).toStrictEqual({existing: true, added: 'value'})
    })

    it('assigns to root when propertyKey is false', () => {
      const meta: Record<string, unknown> = {existing: true}

      assignMeta(meta, {added: 'value'}, false as any)

      expect(meta).toStrictEqual({existing: true, added: 'value'})
    })

    it('assigns to root when propertyKey is empty string', () => {
      const meta: Record<string, unknown> = {existing: true}

      assignMeta(meta, {added: 'value'}, '')

      expect(meta).toStrictEqual({existing: true, added: 'value'})
    })

    it('overwrites existing non-object property with the given key', () => {
      const meta: Record<string, unknown> = {field: 'string-value'}

      assignMeta(meta, {nested: true}, 'field')

      expect(meta).toStrictEqual({field: {nested: true}})
    })
  })
})
