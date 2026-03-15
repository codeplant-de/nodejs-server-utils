import {defaultContextToMetaFormatter} from './contextToMetaFormatter'

describe('defaults', () => {
  describe('defaultContextToMetaFormatter', () => {
    it('returns undefined regardless of input', () => {
      expect(defaultContextToMetaFormatter({})).toBeUndefined()
    })

    it('returns undefined for a context with data', () => {
      expect(defaultContextToMetaFormatter({user: 'test', role: 'admin'})).toBeUndefined()
    })
  })
})
