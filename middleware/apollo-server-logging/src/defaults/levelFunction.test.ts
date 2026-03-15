import {defaultLevelFunction} from './levelFunction'

describe('defaults', () => {
  describe('defaultLevelFunction', () => {
    it('returns "info" when no errors are provided', () => {
      expect(defaultLevelFunction({}, {}, {}, undefined)).toEqual('info')
    })

    it('returns "info" when errors array is empty', () => {
      expect(defaultLevelFunction({}, {}, {}, [])).toEqual('info')
    })

    it('returns "error" when at least one error is present', () => {
      expect(defaultLevelFunction({}, {}, {}, [{message: 'err'}])).toEqual('error')
    })

    it('returns "error" when multiple errors are present', () => {
      expect(defaultLevelFunction({}, {}, {}, [{message: 'err1'}, {message: 'err2'}])).toEqual(
        'error'
      )
    })
  })
})
