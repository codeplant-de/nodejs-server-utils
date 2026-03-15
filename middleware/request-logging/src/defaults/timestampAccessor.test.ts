import {defaultTimestampAccessor} from './timestampAccessor'

describe('defaults', () => {
  describe('defaultTimestampAccessor', () => {
    it('returns a number', () => {
      const result = defaultTimestampAccessor()

      expect(typeof result).toBe('number')
    })

    it('returns increasing values on subsequent calls', () => {
      const first = defaultTimestampAccessor()
      const second = defaultTimestampAccessor()

      expect(second).toBeGreaterThanOrEqual(first)
    })
  })
})
