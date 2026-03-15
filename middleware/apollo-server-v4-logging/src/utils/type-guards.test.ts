import {isObj} from './type-guards'

describe('utils', () => {
  describe('isObj', () => {
    it('returns true for a plain object', () => {
      expect(isObj({})).toBe(true)
    })

    it('returns true for an object with properties', () => {
      expect(isObj({foo: 'bar'})).toBe(true)
    })

    it('returns false for null', () => {
      expect(isObj(null)).toBe(false)
    })

    it('returns false for undefined', () => {
      expect(isObj(undefined)).toBe(false)
    })

    it('returns false for an array', () => {
      expect(isObj([])).toBe(false)
      expect(isObj([1, 2, 3])).toBe(false)
    })

    it('returns false for a string', () => {
      expect(isObj('hello')).toBe(false)
    })

    it('returns false for a number', () => {
      expect(isObj(42)).toBe(false)
    })

    it('returns false for a boolean', () => {
      expect(isObj(true)).toBe(false)
    })

    it('returns true for a nested object', () => {
      expect(isObj({nested: {deep: true}})).toBe(true)
    })
  })
})
