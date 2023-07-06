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
  })
})
