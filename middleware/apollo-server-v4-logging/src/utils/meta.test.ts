import {assignArrayMeta, assignMeta} from './meta'

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

      assignMeta(meta, {added: 'value'}, false)

      expect(meta).toStrictEqual({existing: true, added: 'value'})
    })

    it('assigns to root when propertyKey is empty string', () => {
      const meta: Record<string, unknown> = {existing: true}

      assignMeta(meta, {added: 'value'}, '')

      expect(meta).toStrictEqual({existing: true, added: 'value'})
    })
  })

  describe('assignArrayMeta', () => {
    it('properly assigns array data to a new array at the given property key', () => {
      const rootMeta = {foo: 'bar'}
      const data = [{bar: 'baz'}]

      assignArrayMeta(rootMeta, data, 'subFoo')

      expect(rootMeta).toStrictEqual({foo: 'bar', subFoo: [{bar: 'baz'}]})
    })

    it('properly assigns array data to a given array at the given property key', () => {
      const rootMeta = {foo: 'bar', subFoo: [{subBar: true}]}
      const data = [{bar: 'baz'}]

      assignArrayMeta(rootMeta, data, 'subFoo')

      expect(rootMeta).toStrictEqual({foo: 'bar', subFoo: [{subBar: true}, {bar: 'baz'}]})
    })

    it('overwrites existing non-array property', () => {
      const meta: Record<string, unknown> = {field: 'not-an-array'}

      assignArrayMeta(meta, [{new: true}], 'field')

      expect(meta).toStrictEqual({field: [{new: true}]})
    })
  })
})
