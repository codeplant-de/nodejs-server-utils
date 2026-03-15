import {defaultErrorToMetaFormatter} from './errorToMetaFormatter'

describe('defaults', () => {
  describe('defaultErrorToMetaFormatter', () => {
    it('returns a shallow copy of the error object', () => {
      const err = {message: 'test-error', extensions: {code: 'MY_CODE'}}

      const result = defaultErrorToMetaFormatter(err as any)

      expect(result).toStrictEqual({message: 'test-error', extensions: {code: 'MY_CODE'}})
    })

    it('returns a new object (not the same reference)', () => {
      const err = {message: 'test-error'}

      const result = defaultErrorToMetaFormatter(err as any)

      expect(result).not.toBe(err)
      expect(result).toStrictEqual({message: 'test-error'})
    })

    it('handles an error with no extra properties', () => {
      const err = {}

      const result = defaultErrorToMetaFormatter(err as any)

      expect(result).toStrictEqual({})
    })
  })
})
