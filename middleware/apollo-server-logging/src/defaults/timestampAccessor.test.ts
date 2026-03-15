import {defaultTimestampAccessor} from './timestampAccessor'

describe('defaults', () => {
  describe('defaultTimestampAccessor', () => {
    it('returns a number', () => {
      expect(typeof defaultTimestampAccessor()).toBe('number')
    })

    it('returns a value based on performance.now()', () => {
      const before = performance.now()
      const result = defaultTimestampAccessor()
      const after = performance.now()

      expect(result).toBeGreaterThanOrEqual(before)
      expect(result).toBeLessThanOrEqual(after)
    })
  })
})
