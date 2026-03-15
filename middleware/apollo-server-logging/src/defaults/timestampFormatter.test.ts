import {defaultTimestampFormatter} from './timestampFormatter'

describe('defaults', () => {
  describe('defaultTimestampFormatter', () => {
    it('rounds to 4 decimal places', () => {
      expect(defaultTimestampFormatter(1.23456789)).toEqual(1.2346)
    })

    it('handles whole numbers', () => {
      expect(defaultTimestampFormatter(5)).toEqual(5)
    })

    it('handles zero', () => {
      expect(defaultTimestampFormatter(0)).toEqual(0)
    })

    it('rounds correctly at the boundary', () => {
      expect(defaultTimestampFormatter(1.00005)).toEqual(1.0001)
      expect(defaultTimestampFormatter(1.00004)).toEqual(1)
    })

    it('handles large numbers', () => {
      expect(defaultTimestampFormatter(123456.789012345)).toEqual(123456.789)
    })
  })
})
