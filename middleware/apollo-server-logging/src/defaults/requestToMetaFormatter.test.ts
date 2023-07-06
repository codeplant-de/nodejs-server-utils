import {filterSensitiveVariablesHelper} from './requestToMetaFormatter'

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
})
