import {defaultResponseToMetaFormatter} from './responseToMetaFormatter'

describe('defaults', () => {
  describe('defaultResponseToMetaFormatter', () => {
    it('returns undefined regardless of input', () => {
      expect(defaultResponseToMetaFormatter({})).toBeUndefined()
    })

    it('returns undefined for a response with data', () => {
      expect(defaultResponseToMetaFormatter({data: {foo: 'bar'}})).toBeUndefined()
    })
  })
})
