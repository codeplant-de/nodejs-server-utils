import {createMocks} from 'node-mocks-http'

import {defaultSkipFunction} from './skipFunction'

describe('defaults', () => {
  describe('defaultSkipFunction', () => {
    it('always returns false', () => {
      const {req, res} = createMocks()

      expect(defaultSkipFunction(req, res)).toBe(false)
    })

    it('returns false regardless of request method or status code', () => {
      const {req, res} = createMocks({
        method: 'POST',
        url: '/some-path',
      })
      res.statusCode = 500

      expect(defaultSkipFunction(req, res)).toBe(false)
    })
  })
})
