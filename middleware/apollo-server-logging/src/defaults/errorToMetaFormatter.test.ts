import {defaultErrorToMetaFormatter} from './errorToMetaFormatter'

describe('defaults', () => {
  describe('defaultErrorToMetaFormatter', () => {
    it('returns a shallow copy of the error object', () => {
      const err = {message: 'test-error', extensions: {code: 'MY_CODE'}}

      const result = defaultErrorToMetaFormatter(err)

      expect(result).toStrictEqual({message: 'test-error', extensions: {code: 'MY_CODE'}})
    })

    it('spreads the error properties into a new object', () => {
      const err = {message: 'test-error'}

      const result = defaultErrorToMetaFormatter(err)

      expect(result).not.toBe(err)
      expect(result).toStrictEqual({message: 'test-error'})
    })

    it('handles an error with no extra properties', () => {
      const err = {message: 'simple'}

      expect(defaultErrorToMetaFormatter(err)).toStrictEqual({message: 'simple'})
    })
  })
})
