import {isObj} from './type-guards'

describe('utils', () => {
  describe('isObj', () => {
    it('returns true for a plain object', () => {
      expect(isObj({foo: 'bar'})).toBe(true)
    })

    it('returns true for an empty object', () => {
      expect(isObj({})).toBe(true)
    })

    it('returns false for null', () => {
      expect(isObj(null)).toBe(false)
    })

    it('returns false for undefined', () => {
      expect(isObj(undefined)).toBe(false)
    })

    it('returns false for an array', () => {
      expect(isObj([1, 2, 3])).toBe(false)
    })

    it('returns false for an empty array', () => {
      expect(isObj([])).toBe(false)
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
      expect(isObj({a: {b: {c: 1}}})).toBe(true)
    })

    it('returns true for an object created with Object.create(null)', () => {
      expect(isObj(Object.create(null))).toBe(true)
    })

    it('returns false for a function', () => {
      expect(isObj(() => {})).toBe(false)
    })
  })
})
