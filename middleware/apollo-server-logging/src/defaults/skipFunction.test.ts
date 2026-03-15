import {defaultSkipFunction} from './skipFunction'

describe('defaults', () => {
  describe('defaultSkipFunction', () => {
    it('always returns false', () => {
      expect(defaultSkipFunction({}, {}, {}, [])).toBe(false)
    })

    it('returns false regardless of arguments', () => {
      expect(
        defaultSkipFunction({operationName: 'Test'}, {data: {}}, {userId: 1}, [{message: 'err'}])
      ).toBe(false)
    })

    it('returns false when called with no errors', () => {
      expect(defaultSkipFunction({}, undefined, {})).toBe(false)
    })
  })
})
