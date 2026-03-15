import {createResponse} from 'node-mocks-http'

import {defaultResponseToMetaFormatter} from './responseToMetaFormatter'

describe('defaults', () => {
  describe('defaultResponseToMetaFormatter', () => {
    it('returns the status code from the response', () => {
      const res = createResponse()

      expect(defaultResponseToMetaFormatter(res)).toStrictEqual({
        statusCode: 200,
      })
    })

    it('returns a non-200 status code', () => {
      const res = createResponse()
      res.statusCode = 404

      expect(defaultResponseToMetaFormatter(res)).toStrictEqual({
        statusCode: 404,
      })
    })

    it('returns a 500 status code', () => {
      const res = createResponse()
      res.statusCode = 500

      expect(defaultResponseToMetaFormatter(res)).toStrictEqual({
        statusCode: 500,
      })
    })
  })
})
