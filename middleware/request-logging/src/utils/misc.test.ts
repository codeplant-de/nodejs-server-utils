import {createRequest, createResponse} from 'node-mocks-http'
import {mergeFormatters, formatTimestamp, filterSensitiveVariablesHelper} from './misc'
import {FILTERED_INDICATOR} from '../constants'
import {RequestToMetaFormatter, ResponseToMetaFormatter} from '../defaults'

describe('utils', () => {
  describe('mergeFormatters', () => {
    it('can merge RequestToMeta formatters', () => {
      const f1: RequestToMetaFormatter<any> = req => ({method: req.method})
      const f2: RequestToMetaFormatter<any> = req => ({url: req.url})

      const testRequest = createRequest({url: '/ping'})

      const formatter = mergeFormatters([f1, f2])

      expect(formatter(testRequest)).toStrictEqual({
        method: 'GET',
        url: '/ping',
      })
    })

    it('later formatters override earlier keys', () => {
      const f1 = (): Record<string, unknown> => ({key: 'first', other: 'kept'})
      const f2 = (): Record<string, unknown> => ({key: 'second'})

      const formatter = mergeFormatters([f1, f2])

      expect(formatter()).toStrictEqual({key: 'second', other: 'kept'})
    })

    it('returns an empty object for an empty array', () => {
      const formatter = mergeFormatters([])

      expect(formatter()).toStrictEqual({})
    })

    it('works with a single formatter', () => {
      const f1 = (): Record<string, unknown> => ({only: 'one'})

      const formatter = mergeFormatters([f1])

      expect(formatter()).toStrictEqual({only: 'one'})
    })

    it('can merge ResponseToMeta formatters', () => {
      const f1: ResponseToMetaFormatter<any> = res => ({statusCode: res.statusCode})
      const f2: ResponseToMetaFormatter<any> = res => ({statusMessage: res.statusMessage})

      const testResponse = createResponse()

      const formatter = mergeFormatters([f1, f2])

      expect(formatter(testResponse)).toStrictEqual({
        statusCode: 200,
        statusMessage: 'OK',
      })
    })
  })

  describe('formatTimestamp', () => {
    it('rounds a timestamp to 4 decimal places', () => {
      expect(formatTimestamp(1.23456789)).toBe(1.2346)
    })

    it('returns the same value if it has fewer than 4 decimals', () => {
      expect(formatTimestamp(1.23)).toBe(1.23)
    })

    it('handles zero', () => {
      expect(formatTimestamp(0)).toBe(0)
    })

    it('handles whole numbers', () => {
      expect(formatTimestamp(5)).toBe(5)
    })

    it('handles very small numbers', () => {
      expect(formatTimestamp(0.00001)).toBe(0)
    })
  })

  describe('filterSensitiveVariablesHelper', () => {
    it('filters a sensitive variable', () => {
      const result = filterSensitiveVariablesHelper({username: 'john', password: 'secret123'}, [
        'password',
      ])
      expect(result).toStrictEqual({
        username: 'john',
        password: FILTERED_INDICATOR,
      })
    })

    it('does not filter non-sensitive variables', () => {
      const result = filterSensitiveVariablesHelper({username: 'john', email: 'john@example.com'}, [
        'password',
      ])
      expect(result).toStrictEqual({
        username: 'john',
        email: 'john@example.com',
      })
    })

    it('filters multiple sensitive variables', () => {
      const result = filterSensitiveVariablesHelper(
        {username: 'john', password: 'secret', token: 'abc123'},
        ['password', 'token']
      )
      expect(result).toStrictEqual({
        username: 'john',
        password: FILTERED_INDICATOR,
        token: FILTERED_INDICATOR,
      })
    })

    it('recursively filters nested objects', () => {
      const result = filterSensitiveVariablesHelper({user: {name: 'john', password: 'secret'}}, [
        'password',
      ])
      expect(result).toStrictEqual({
        user: {name: 'john', password: FILTERED_INDICATOR},
      })
    })

    it('handles empty variables object', () => {
      const result = filterSensitiveVariablesHelper({}, ['password'])
      expect(result).toStrictEqual({})
    })

    it('handles empty sensitive list', () => {
      const result = filterSensitiveVariablesHelper({username: 'john', password: 'secret'}, [])
      expect(result).toStrictEqual({
        username: 'john',
        password: 'secret',
      })
    })

    it('handles deeply nested objects', () => {
      const result = filterSensitiveVariablesHelper(
        {level1: {level2: {secret: 'hidden', safe: 'visible'}}},
        ['secret']
      )
      expect(result).toStrictEqual({
        level1: {level2: {secret: FILTERED_INDICATOR, safe: 'visible'}},
      })
    })
  })
})
