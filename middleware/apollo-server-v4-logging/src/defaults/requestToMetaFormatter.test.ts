import {NA_IP, NA_OPERATION_NAME} from '../constants'
import {
  filterSensitiveVariablesHelper,
  getIpFromGraphQLRequest,
  defaultRequestToMetaFormatter,
} from './requestToMetaFormatter'

describe('getIpFromGraphQLRequest', () => {
  it('returns null when req.http is undefined', () => {
    expect(getIpFromGraphQLRequest({} as any)).toBeNull()
  })

  it('returns null when x-forwarded-for header is absent', () => {
    const req = {http: {headers: new Map()}}
    expect(getIpFromGraphQLRequest(req as any)).toBeNull()
  })

  it('returns the first IP from a comma-separated x-forwarded-for', () => {
    const headers = new Map([['x-forwarded-for', '10.0.0.1, 10.0.0.2']])
    const req = {http: {headers}}
    expect(getIpFromGraphQLRequest(req as any)).toBe('10.0.0.1')
  })

  it('returns a single IP from x-forwarded-for', () => {
    const headers = new Map([['x-forwarded-for', '192.168.1.1']])
    const req = {http: {headers}}
    expect(getIpFromGraphQLRequest(req as any)).toBe('192.168.1.1')
  })
})

describe('defaultRequestToMetaFormatter', () => {
  it('returns operationName, clientIp, and filtered variables for a complete request', () => {
    const headers = new Map([['x-forwarded-for', '1.2.3.4']])
    const req = {
      operationName: 'GetUser',
      variables: {id: '123', password: 'secret'},
      http: {headers},
    }

    const result = defaultRequestToMetaFormatter(req as any)

    expect(result).toStrictEqual({
      operationName: 'GetUser',
      clientIp: '1.2.3.4',
      variables: {id: '123', password: '[FILTERED]'},
    })
  })

  it('returns NA_OPERATION_NAME when operationName is falsy', () => {
    const req = {operationName: '', variables: {}, http: {headers: new Map()}}

    const result = defaultRequestToMetaFormatter(req as any)

    expect(result).toStrictEqual(expect.objectContaining({operationName: NA_OPERATION_NAME}))
  })

  it('returns NA_IP when no x-forwarded-for header is present', () => {
    const req = {operationName: 'Test', variables: {}, http: {headers: new Map()}}

    const result = defaultRequestToMetaFormatter(req as any)

    expect(result).toStrictEqual(expect.objectContaining({clientIp: NA_IP}))
  })

  it('returns variables as undefined when req.variables is falsy', () => {
    const req = {operationName: 'Test', variables: undefined, http: {headers: new Map()}}

    const result = defaultRequestToMetaFormatter(req as any)

    expect(result).toStrictEqual(expect.objectContaining({variables: undefined}))
  })
})

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
