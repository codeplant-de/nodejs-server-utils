import {mergeFormatters} from './formatter'

describe('utils', () => {
  describe('mergeFormatters', () => {
    it('returns an empty object when given an empty array of formatters', () => {
      const merged = mergeFormatters([])

      expect(merged('input')).toStrictEqual({})
    })

    it('returns the result of a single formatter', () => {
      const formatter = (val: string) => ({key: val})
      const merged = mergeFormatters([formatter])

      expect(merged('test')).toStrictEqual({key: 'test'})
    })

    it('merges results from multiple formatters', () => {
      const formatter1 = (val: string) => ({first: val})
      const formatter2 = (val: string) => ({second: val.toUpperCase()})
      const merged = mergeFormatters([formatter1, formatter2] as any)

      expect(merged('test')).toStrictEqual({first: 'test', second: 'TEST'})
    })

    it('later formatters overwrite earlier ones for the same key', () => {
      const formatter1 = () => ({key: 'first'})
      const formatter2 = () => ({key: 'second'})
      const merged = mergeFormatters([formatter1, formatter2])

      expect(merged()).toStrictEqual({key: 'second'})
    })

    it('handles formatters returning undefined by not adding properties', () => {
      const formatter1 = () => ({key: 'value'})
      const formatter2 = () => undefined as unknown as Record<string, unknown>
      const merged = mergeFormatters([formatter1, formatter2])

      expect(merged()).toStrictEqual({key: 'value'})
    })

    it('passes all arguments to each formatter', () => {
      const formatter1 = (a: string, b: number) => ({combined: `${a}-${b}`})
      const formatter2 = (a: string, b: number) => ({sum: `${a}+${b}`})
      const merged = mergeFormatters([formatter1, formatter2] as any)

      expect(merged('hello', 42)).toStrictEqual({combined: 'hello-42', sum: 'hello+42'})
    })
  })
})
