import {assignArrayMeta, assignMeta, filterSensitiveVariablesHelper} from './utils'

describe('utils', () => {
  describe('filterSensitiveVariablesHelper', () => {
    describe('simple initialization', () => {
      it('does not crash for an empty object', () => {
        expect(() => filterSensitiveVariablesHelper({}, [])).not.toThrowError()
        expect(() => filterSensitiveVariablesHelper({}, ['test'])).not.toThrowError()
      })

      it('does not crash for a flat object', () => {
        expect(() => filterSensitiveVariablesHelper({foo: 'bar'}, [])).not.toThrowError()
        expect(() => filterSensitiveVariablesHelper({foo: 'bar'}, ['test'])).not.toThrowError()
      })

      it('does not crash for a nested object', () => {
        expect(() => filterSensitiveVariablesHelper({foo: {baz: 'bar'}}, [])).not.toThrowError()
        expect(() =>
          filterSensitiveVariablesHelper({foo: {baz: 'bar'}}, ['test'])
        ).not.toThrowError()
      })
    })

    it('filters out variables in a flat object', () => {
      expect(filterSensitiveVariablesHelper({foo: 'bar', baz: 'qux'}, ['baz'])).toStrictEqual({
        foo: 'bar',
        baz: '[FILTERED]',
      })
    })

    it('filters out variables in a nested object', () => {
      const variables = {
        foo: 'bar',
        baz: {
          qux: {
            quux: 'corge',
          },
          waldo: 'fred',
        },
      }

      const sensitiveVariables = ['qux']

      expect(filterSensitiveVariablesHelper(variables, sensitiveVariables)).toStrictEqual({
        foo: 'bar',
        baz: {
          qux: '[FILTERED]',
          waldo: 'fred',
        },
      })
    })
  })

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
