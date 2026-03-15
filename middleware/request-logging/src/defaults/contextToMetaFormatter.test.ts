import {createMocks} from 'node-mocks-http'

import {defaultContextToMetaFormatter} from './contextToMetaFormatter'

describe('defaults', () => {
  describe('defaultContextToMetaFormatter', () => {
    it('returns undefined', () => {
      const {req, res} = createMocks()

      expect(defaultContextToMetaFormatter(req, res)).toBeUndefined()
    })
  })
})
