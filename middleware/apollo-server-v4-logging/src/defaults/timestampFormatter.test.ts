import {defaultTimestampFormatter} from './timestampFormatter'

describe('defaults', () => {
  describe('defaultTimestampFormatter', () => {
    it('rounds to 4 decimal places', () => {
      expect(defaultTimestampFormatter(1.123456789)).toEqual(1.1235)
    })

    it('handles whole numbers', () => {
      expect(defaultTimestampFormatter(5)).toEqual(5)
    })

    it('handles zero', () => {
      expect(defaultTimestampFormatter(0)).toEqual(0)
    })

    it('handles numbers with fewer than 4 decimal places', () => {
      expect(defaultTimestampFormatter(1.12)).toEqual(1.12)
    })

    it('correctly rounds up', () => {
      expect(defaultTimestampFormatter(1.00005)).toEqual(1.0001)
    })

    it('correctly rounds down', () => {
      expect(defaultTimestampFormatter(1.00004)).toEqual(1)
    })
  })
})
