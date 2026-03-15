import {defaultLevelFunction} from './levelFunction'

describe('defaults', () => {
  describe('defaultLevelFunction', () => {
    it('is the string "info"', () => {
      expect(defaultLevelFunction).toBe('info')
    })
  })
})
