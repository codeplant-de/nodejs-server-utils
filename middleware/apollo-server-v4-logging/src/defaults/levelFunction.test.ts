import {defaultLevelFunction} from './levelFunction'

describe('defaults', () => {
  describe('defaultLevelFunction', () => {
    it('returns "info" when no errors are provided', () => {
      expect(defaultLevelFunction({}, {}, {}, undefined)).toEqual('info')
    })

    it('returns "info" when errors array is empty', () => {
      expect(defaultLevelFunction({}, {}, {}, [])).toEqual('info')
    })

    it('returns "error" when errors array has one error', () => {
      expect(defaultLevelFunction({}, {}, {}, [{message: 'error'}])).toEqual('error')
    })

    it('returns "error" when errors array has multiple errors', () => {
      expect(defaultLevelFunction({}, {}, {}, [{message: 'error1'}, {message: 'error2'}])).toEqual(
        'error'
      )
    })
  })
})
