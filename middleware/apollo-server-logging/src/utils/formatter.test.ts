import {mergeFormatters} from './formatter'

describe('utils', () => {
  describe('mergeFormatters', () => {
    it('returns an empty object when given no formatters', () => {
      const merged = mergeFormatters([])

      expect(merged('input')).toStrictEqual({})
    })

    it('returns the result of a single formatter', () => {
      const formatter = (val: string) => ({key: val})
      const merged = mergeFormatters([formatter])

      expect(merged('hello')).toStrictEqual({key: 'hello'})
    })

    it('merges the results of multiple formatters', () => {
      const formatter1 = (val: string) => ({first: val})
      const formatter2 = (val: string) => ({second: val.toUpperCase()})
      const merged = mergeFormatters([formatter1, formatter2] as any)

      expect(merged('hello')).toStrictEqual({first: 'hello', second: 'HELLO'})
    })

    it('later formatters override earlier ones for the same key', () => {
      const formatter1 = () => ({key: 'first'})
      const formatter2 = () => ({key: 'second'})
      const merged = mergeFormatters([formatter1, formatter2])

      expect(merged()).toStrictEqual({key: 'second'})
    })

    it('handles formatters that return undefined', () => {
      const formatter1 = () => ({key: 'value'})
      const formatter2 = () => undefined
      const merged = mergeFormatters([formatter1, formatter2 as any])

      expect(merged()).toStrictEqual({key: 'value'})
    })

    it('passes all arguments to each formatter', () => {
      const formatter = (a: string, b: number) => ({a, b})
      const merged = mergeFormatters([formatter])

      expect(merged('test', 42)).toStrictEqual({a: 'test', b: 42})
    })
  })
})
