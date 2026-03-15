import {defaultSkipFunction} from './skipFunction'

describe('defaults', () => {
  describe('defaultSkipFunction', () => {
    it('always returns false', () => {
      expect(defaultSkipFunction({}, {}, {}, [])).toBe(false)
    })

    it('returns false regardless of arguments', () => {
      expect(defaultSkipFunction({operationName: 'TestOp'}, {data: {}}, {user: 'test'}, [])).toBe(
        false
      )
    })

    it('returns false when errors are provided', () => {
      expect(defaultSkipFunction({}, undefined, {}, [{message: 'error'}])).toBe(false)
    })
  })
})
