import {createRequest, createResponse} from 'node-mocks-http'
import {mergeFormatters} from './misc'
import {RequestToMetaFormatter, ResponseToMetaFormatter} from '../defaults'

describe('utils', () => {
  describe('mergeFormatters', () => {
    it('can merge RequestToMeta formatters', () => {
      const f1: RequestToMetaFormatter<any> = req => ({method: req.method})
      const f2: RequestToMetaFormatter<any> = req => ({url: req.url})

      const testRequest = createRequest({url: '/ping'})

      const formatter = mergeFormatters([f1, f2])

      expect(formatter(testRequest)).toStrictEqual({
        method: 'GET',
        url: '/ping',
      })
    })

    it('can merge ResponseToMeta formatters', () => {
      const f1: ResponseToMetaFormatter<any> = res => ({statusCode: res.statusCode})
      const f2: ResponseToMetaFormatter<any> = res => ({statusMessage: res.statusMessage})

      const testResponse = createResponse()

      const formatter = mergeFormatters([f1, f2])

      expect(formatter(testResponse)).toStrictEqual({
        statusCode: 200,
        statusMessage: 'OK',
      })
    })
  })
})
